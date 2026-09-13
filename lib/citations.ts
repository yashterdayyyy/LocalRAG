export function getCitationUrl(filePath: string){
    const owner = "yashterdayyyy";
    const repo = "LocalRAG";
    const branch = "main";

    return `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`;
}
