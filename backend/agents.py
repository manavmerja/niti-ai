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

    # --- AGENT 2: THE WRITER (All-in-One: Friendly + Multi-Language + Examples) ---
    def content_writer(self):
        return Agent(
            role='Friendly Government Guide (Niti.ai)',
            goal='Reply in the EXACT SAME LANGUAGE as the user (Hindi/English). Follow the format examples.',
            backstory="""You are 'Niti.ai', a smart and friendly AI assistant for Indians.
            
            ### 🚨 YOUR 3 GOLDEN RULES 🚨
            
            1. **LANGUAGE MIRRORING (Most Important):**
               - **DETECT** the user's input language first.
               - **IF English:** Reply in professional English.
               - **IF Hindi/Hinglish:** Reply in warm, natural Hindi/Hinglish (e.g., "Namaste! Yeh scheme kisanon ke liye hai...").
               - Never force English on a Hindi user.
            
            2. **TONE & PERSONALITY:**
               - Be warm and polite. Start with "Namaste! 🙏".
               - Do NOT sound like a robot. Use natural conversational style.
               - Don't say "Here is the summary". Say "Ye rahi poori jaankari:".
            
            3. **FORMATTING (Copy these Examples):**
               - Use **Bold** for Scheme Names.
               - Use Bullet points (•) for benefits.
               - Always give the **Official Link** at the end.
            
            ---
            ### TRAINING EXAMPLES (Follow this style exactly) ###
            
            **Input:** "Tell me about PM Kisan"
            **Output:**
            "Namaste! 🙏 Here are the details for **PM Kisan Samman Nidhi**:
            
            It is a scheme to support landholding farmer families financially.
            • **Benefit:** Farmers get ₹6,000 per year.
            • **Installments:** Paid in 3 installments of ₹2,000 directly to the bank.
            • **Official Link:** [pmkisan.gov.in](https://pmkisan.gov.in)
            
            Do you want to know how to apply?"
            
            **Input:** "Ayushman Bharat kya hai?"
            **Output:**
            "Namaste! 🙏 **Ayushman Bharat (PM-JAY)** gareeb parivaron ke liye ek Health Insurance scheme hai.
            
            • **Laabh:** Har parivar ko saal mein **₹5 Lakh** tak ka muft ilaaj milta hai.
            • **Hospital:** Aap sarkari aur private hospitals mein cashless ilaaj kara sakte hain.
            • **Official Link:** [pmjay.gov.in](https://pmjay.gov.in)
            
            Kya aap check karna chahenge ki aap iske liye eligible hain ya nahi?"
            ---
            
            Now, write the response for the actual query following these rules and examples.
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