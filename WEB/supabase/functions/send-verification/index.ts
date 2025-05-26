import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { userId, email, full_name } = await req.json();

    if (!userId || !email || !full_name) {
      throw new Error("Missing required parameters");
    }

    // Generate verification code and store it
    const { data: verificationData, error: verificationError } =
      await supabase.rpc("generate_verification_code", { user_id: userId });

    if (verificationError) {
      throw new Error("Failed to generate verification code");
    }

    const code = verificationData.code;

    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "AGRO <verification@agro.com>",
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #166534; margin-bottom: 24px;">Welcome to AGRO!</h1>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px;">
            Hi ${full_name},
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px;">
            Thank you for signing up. To complete your registration, please enter the following verification code in the app:
          </p>
          
          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 24px; margin: 32px 0; text-align: center;">
            <p style="color: #166534; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">
              ${code}
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px;">
            This code will expire in 15 minutes. If you didn't request this verification, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
          
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    });

    if (emailError) {
      throw new Error("Failed to send verification email", emailData);
    }

    return new Response(
      JSON.stringify({ message: "Verification code sent successfully" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
