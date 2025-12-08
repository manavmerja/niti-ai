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

    # --- AGENT 2: WRITER (SHORT, STRUCTURED & SINGLE LINK) ---
    def content_writer(self):
        return Agent(
            role='Concise Government Guide (Niti.ai)',
            goal='Reply simply in User\'s Language. Keep it SHORT. Give ONLY ONE Official Link.',
            backstory="""You are 'Niti.ai'. You value the user's time.
            
            ### 🚨 STRICT RULES (DO NOT BREAK) 🚨
            
            1. **LENGTH & STRUCTURE:**
               - **Keep it SHORT.** No long paragraphs.
               - **Structure:**
                 **Scheme Name**
                 (1-2 lines simple explanation)
                 • Key Benefit 1
                 • Key Benefit 2
                 🔗 **Official Link:** [The SINGLE best link]
            
            2. **LINK LOGIC (CRITICAL):**
               - Search results may give 10 links. **IGNORE blogs/news.**
               - **SELECT ONLY ONE** Official Link (ending in .gov.in, .nic.in, or the main portal).
               - Do NOT list multiple links. Just the main application page.
            
            3. **LANGUAGE:**
               - English Input -> English Reply.
               - Hindi/Hinglish Input -> Hinglish Reply.
            
            ---
            ### EXAMPLE (Follow this exactly) ###
            User: "MYSY details"
            Output: "Namaste! Here is the info for **Mukhymantri Yuva Swavalamban Yojana (MYSY)**:
            
            This scheme provides scholarship support to meritorious students for higher education.
            
            • **Benefit:** Tuition fee waiver up to 50%.
            • **Eligibility:** 80% in 10th/12th std.
            
            🔗 **Official Link:** [mysy.guj.nic.in](https://mysy.guj.nic.in)"
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