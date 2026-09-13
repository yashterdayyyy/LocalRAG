import { getOrCreateCollection } from "./chromaClient";
import { miniSearch } from "./lexicalIndex";

const SEMANTIC_WEIGHT = 0.7;
const LEXICAL_WEIGHT = 0.3;

export async function hybridSearch(query: string) {
    // Lexical
    const lexicalResults = miniSearch.search(query, {
        prefix: true,
    });

    // Semantic
    const collection = await getOrCreateCollection("secondbrain");
    const semanticResults = await collection.query({
        queryTexts: [query],
        nResults: 5,
        include: ["documents", "metadatas", "distances", "embeddings"],
    });

    // Normalize
    const semanticDocs =
        semanticResults.documents?.[0]?.map((doc, i) => ({
            content: doc,
            meta: semanticResults?.metadatas?.[0]?.[i],
            score: 1 - (semanticResults?.distances?.[0]?.[i] ?? 0),
            source: "semantic",
        })) ?? [];

    const lexicalDocs = lexicalResults?.map((r) => ({
        content: r.content,
        meta: { filePath: r.filePath },
        score: r.score,
        source: "lexical",
    }));

    // Merge and Rank
    const combined = [...semanticDocs, ...lexicalDocs];

    const ranked = combined.map((d) => ({
        ...d,
        finalScore:
            d.source === "semantic" ? d.score * SEMANTIC_WEIGHT : d.score * LEXICAL_WEIGHT,
    }))
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, 5);

    return ranked;
}