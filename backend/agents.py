import os
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool

# --- 1. SETUP TOOLS ---
search_tool = SerperDevTool()

class NitiAgents:
    def __init__(self):
        if "GROQ_API_KEY" in os.environ:
            print("🔵 Using Groq (Llama 3.3)")
            self.model_name = "groq/llama-3.3-70b-versatile"
        elif "GOOGLE_API_KEY" in os.environ:
            print("🟡 Using Gemini")
            self.model_name = "gemini/gemini-1.5-flash"
        else:
            raise ValueError("❌ API Keys missing in .env")

    # --- AGENT 1: RESEARCHER (Smart Decision Maker) ---
    def government_researcher(self):
        return Agent(
            role='Senior Government Policy Researcher',
            goal='Analyze input: "{topic}". If small talk -> Reply directly. If scheme query -> Search Google.',
            backstory="""You are an expert researcher.
            
            ### DECISION LOGIC ###
            1. **Small Talk / Greetings** (e.g., "Hi", "Hii", "Hello", "Who are you", "Kese ho"): 
               - DO NOT SEARCH GOOGLE.
               - Just pass the greeting to the Writer agent.
            
            2. **Schemes / Information Queries** (e.g., "PM Kisan details", "Loan for students"): 
               - USE 'SerperDevTool' immediately.
               - Find official eligibility, benefits, and application links.
            """,
            verbose=True,
            memory=True,
            tools=[search_tool], 
            llm=self.model_name
        )

    # --- AGENT 2: WRITER (The Upgrade) ---
    def content_writer(self):
        return Agent(
            role='Friendly Government Guide (Niti.ai)',
            goal='Reply in the EXACT language of the user. Follow strict formatting rules.',
            backstory="""You are 'Niti.ai', a smart AI assistant for Indians.
            
            ### 🚨 STRICT LANGUAGE RULES 🚨
            1. **IF INPUT IS ENGLISH (e.g., "Hi", "Hii", "Hello", "Tell me"):**
               - **REPLY IN ENGLISH.**
               - Example: "Namaste! 🙏 I am Niti.ai. How can I help you with Government schemes?"
            
            2. **IF INPUT IS HINDI/HINGLISH (e.g., "Kese ho", "Namaste", "Batao"):**
               - **REPLY IN HINGLISH.**
               - Example: "Namaste! 🙏 Main Niti.ai hoon. Boliye aaj kis yojana ki jaankari chahiye?"
            
            ### 🚨 LINKING & FORMAT RULES 🚨
            - **NO LINKS** for greetings/small talk.
            - **ALWAYS LINK** for specific schemes.
            - **Format:** Use **Bold** for names. Use Bullet points. Keep it clean.
            
            ---
            ### TEST CASE 1 (English Greeting)
            User: "Hii"
            Output: "Namaste! 🙏 I am Niti.ai. I am your AI assistant for government schemes. Let me know what you are looking for!"
            
            ### TEST CASE 2 (Hindi Greeting)
            User: "Kaise ho?"
            Output: "Namaste! 🙏 Main bilkul theek hoon. Aap batayein, kis yojana ki jaankari chahiye?"
            
            ### TEST CASE 3 (Scheme Query)
            User: "Startup India details"
            Output: "Namaste! Here is the info for **Startup India**:
            
            It is a flagship initiative to boost entrepreneurship.
            • **Benefit:** Tax exemptions for 3 years.
            • **Eligibility:** New companies < 10 years old.
            
            🔗 **Official Link:** [startupindia.gov.in](https://www.startupindia.gov.in)"
            ---
            """,
            verbose=True,
            llm=self.model_name
        )

def get_scheme_plan(user_input):
    agents = NitiAgents()
    researcher = agents.government_researcher()
    writer = agents.content_writer()

    # Task 1: Search or Greet
    task1 = Task(
        description=f"Analyze '{user_input}'. If it's a query, search Google for active schemes. If greeting, just pass it.",
        agent=researcher,
        expected_output="Search results with links OR a greeting message."
    )

    # Task 2: Format & Reply
    task2 = Task(
        description=f"Write final reply for '{user_input}'. STRICTLY follow the Language Rules in your backstory.",
        agent=writer,
        context=[task1],
        expected_output="Final formatted response."
    )

    crew = Crew(
        agents=[researcher, writer],
        tasks=[task1, task2],
        verbose=True,
        process=Process.sequential
    )

    return crew.kickoff()