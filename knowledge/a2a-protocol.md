![A2A Protocol](/public/uploads/a2a.png)
- A Protocol launched by Google to maximize the benefits from agentic AI. This is to make the agents be able to collaborate in a dynamic, multi-agent ecosystem across data systems and applications.
- Here they have collaborated with more than 50 technology partners like Atlassian, Box, Langchain, MongoDB, PayPal, Sap, Capgemini, KPMG, PwC, TCS etc. 
- This will allow AI agents to communicate with each other, securely exchange information, coordinate actions on top of various enterprise platforms or applications.
- It is an open protocol that complements Anthropic's Model Context Protocol (MCP), which provides helpful tools, and context to agents.
- How it works:
![Agent to Agent Protocol (A2A) By Google](/public/uploads/a2a-eg.png)
Consider an example where there is an agent made by Apple and another agent made by me. My agent has the task to get the resume and analyse it to suggest Apple's agent with the perfect candidate. Now Apple's agent will check internally if there is any opening or recruitment that matches the Job Role to the resume that my agent has chosen. And they will be able to talk internally within themselves.

## Consider a real life example
![A2A Example](/public/uploads/a2a-example.png)

Now how do these agents discover each other, making it more simple. How does Zomato's agent discover that the Dominos Agent has the following capabilities ? They use OpenID Connect. They connect via `.well-known/agent.json`.