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

    # --- AGENT 1: RESEARCHER ---
    def government_researcher(self):
        return Agent(
            role='Senior Government Policy Researcher',
            goal='Analyze input: "{topic}". If small talk -> Reply. If scheme query -> Search Google.',
            backstory="""You are an expert researcher.
            
            DECISION LOGIC:
            1. **Small Talk** (Hi, How are you, Who are you): 
               - DO NOT SEARCH. Reply friendly.
            2. **Schemes/Queries**: 
               - Use 'SerperDevTool' to find official details & links.
               - Look for: Eligibility, Benefits, Application Link.
            """,
            verbose=True,
            memory=True,
            tools=[search_tool], 
            llm=self.model_name
        )

    # --- AGENT 2: WRITER (TRAINED WITH EXAMPLES) ---
    def content_writer(self):
        return Agent(
            role='Public Information Officer (Sewak)',
            goal='Format the answer exactly like the examples provided below.',
            backstory="""You are 'Niti.ai'. You help Indians find government schemes.
            
            ### STRICT FORMATTING RULES ###
            1. **Language:** If user asks in Hindi/Hinglish -> Reply in Hindi/Hinglish. If English -> Reply in English.
            2. **Structure:** Use **Bold** for Names. Use Bullet points for benefits.
            3. **Links:** You MUST provide the direct 'Official Website Link'.
            
            ---
            ### EXAMPLE 1 (English Query) ###
            User: "Tell me about PM Kisan"
            
            **PM Kisan Samman Nidhi**
            • **Summary:** Financial support for landholding farmer families.
            • **Benefit:** ₹6,000 per year given in 3 installments of ₹2,000 each.
            • **Eligibility:** All landholding farmers families.
            • **Official Link:** [pmkisan.gov.in](https://pmkisan.gov.in)
            
            Would you like to know how to apply?
            ---
            
            ### EXAMPLE 2 (Hindi/Hinglish Query) ###
            User: "Ayushman Bharat kya hai?"
            
            **Ayushman Bharat Yojana (PM-JAY)**
            • **Summary:** Gareeb parivaron ke liye muft swasthya bima (Health Insurance).
            • **Laabh:** Har parivar ko saal mein **₹5 Lakh** tak ka muft ilaaj milta hai.
            • **Kahan Manya Hai:** Sarkari aur listed private hospitals mein cashless ilaaj.
            • **Official Link:** [pmjay.gov.in](https://pmjay.gov.in)
            
            Kya aap iski eligibility check karna chahenge?
            ---
            
            Now, write the response for the actual query following exactly these styles.
            """,
            verbose=True,
            llm=self.model_name
        )

def get_scheme_plan(user_input):
    agents = NitiAgents()
    researcher = agents.government_researcher()
    writer = agents.content_writer()

    task1 = Task(
        description=f"Analyze '{user_input}'. If it's a query, search Google for active schemes in 2024-25. If greeting, just greet.",
        agent=researcher,
        expected_output="Search results with links OR a greeting."
    )

    task2 = Task(
        description=f"Write final reply for '{user_input}'. Follow the EXAMPLES in your backstory strictly.",
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