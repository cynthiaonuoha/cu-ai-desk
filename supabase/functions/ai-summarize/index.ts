

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, summaryType = 'comprehensive' } = await req.json();
    
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    let systemPrompt = '';
    switch (summaryType) {
      case 'brief':
        systemPrompt = 'You are an expert at creating brief, concise summaries. Summarize the following text in 2-3 sentences, capturing only the most essential points.';
        break;
      case 'bullets':
        systemPrompt = 'You are an expert at creating bullet-point summaries. Summarize the following text as clear, organized bullet points. Use • for main points and ◦ for sub-points.';
        break;
      case 'comprehensive':
      default:
        systemPrompt = 'You are an expert at creating comprehensive yet concise summaries for students. Summarize the following text in a well-structured format that captures key concepts, important details, and main ideas. Make it suitable for study and review purposes.';
    }

    console.log('Summarizing text with type:', summaryType);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please summarize this text:\n\n${text}` }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    console.log('Generated summary:', summary);

    return new Response(JSON.stringify({ 
      summary: summary,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-summarize function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

