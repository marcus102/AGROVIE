import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { Resend } from "npm:resend@2.0.0";

// Configuration des en-têtes CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Fonction de validation des entrées
function validateInput(data: {
  userId: string;
  email: string;
  full_name: string;
  status: string;
  rejectionReason?: string;
}) {
  if (!data || typeof data !== "object") {
    throw new Error("Données de requête invalides");
  }

  if (
    !data.userId ||
    typeof data.userId !== "string" ||
    data.userId.trim() === ""
  ) {
    throw new Error("userId est requis et doit être une chaîne non vide");
  }

  if (!data.email || typeof data.email !== "string") {
    throw new Error("email est requis et doit être une chaîne");
  }

  // Validation simple de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error("Format d'email invalide");
  }

  if (
    !data.full_name ||
    typeof data.full_name !== "string" ||
    data.full_name.trim() === ""
  ) {
    throw new Error("full_name est requis et doit être une chaîne non vide");
  }

  if (!data.status || !["approved", "rejected"].includes(data.status)) {
    throw new Error('status est requis et doit être "approved" ou "rejected"');
  }

  if (
    data.status === "rejected" &&
    data.rejectionReason &&
    typeof data.rejectionReason !== "string"
  ) {
    throw new Error("rejectionReason doit être une chaîne si fourni");
  }

  return true;
}

// Fonction de validation des variables d'environnement
function validateEnvironmentVariables() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!supabaseUrl) {
    throw new Error(
      "SUPABASE_URL n'est pas définie dans les variables d'environnement"
    );
  }
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY n'est pas définie dans les variables d'environnement"
    );
  }
  if (!resendApiKey) {
    throw new Error(
      "RESEND_API_KEY n'est pas définie dans les variables d'environnement"
    );
  }

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
    resendApiKey,
  };
}

// Fonction pour sanitiser les données pour les logs
function sanitizeForLog(data: {
  userId: string;
  email: string;
  full_name: string;
  status: string;
  rejectionReason?: string;
}) {
  const sanitized = { ...data };
  if (sanitized.email) {
    const [localPart, domain] = sanitized.email.split("@");
    sanitized.email = `${localPart.substring(0, 2)}***@${domain}`;
  }
  return sanitized;
}

// Template d'email pour documents approuvés
function generateApprovedEmailTemplate(fullName: string) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Documents approuvés - AGROVIE</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- En-tête -->
        <div style="background: linear-gradient(135deg, #166534 0%, #22c55e 100%); padding: 40px 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
            ✅ Documents Approuvés !
          </h1>
        </div>
        
        <!-- Contenu principal -->
        <div style="padding: 40px 32px;">
          <p style="color: #374151; font-size: 18px; line-height: 28px; margin: 0 0 24px 0;">
            Félicitations <strong>${fullName}</strong> !
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 32px 0;">
            Nous avons le plaisir de vous informer que vos documents ont été <strong>approuvés</strong> avec succès.
          </p>
          
          <!-- Message de succès -->
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #22c55e; border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
            <p style="color: #166534; font-size: 20px; font-weight: 600; margin: 0;">
              Votre compte est maintenant entièrement vérifié !
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 24px 0;">
            Vous pouvez désormais accéder à toutes les fonctionnalités d'AGROVIE. 
            Profitez pleinement de notre plateforme pour développer vos activités agricoles.
          </p>
          
          <!-- Prochaines étapes -->
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 32px 0;">
            <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 12px 0;">
              🚀 Prochaines étapes
            </h3>
            <ul style="color: #374151; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>Explorez toutes les fonctionnalités disponibles</li>
              <li>Complétez votre profil si nécessaire</li>
              <li>Connectez-vous avec d'autres utilisateurs</li>
              <li>Commencez à utiliser nos services premium</li>
            </ul>
          </div>
        </div>
        
        <!-- Pied de page -->
        <div style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; text-align: center;">
            Merci de faire confiance à AGROVIE !
          </p>
          <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
            © ${new Date().getFullYear()} AGROVIE - Tous droits réservés
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

// Template d'email pour documents rejetés
function generateRejectedEmailTemplate(fullName: string, rejectionReason = "") {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Documents à revoir - AGROVIE</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- En-tête -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
            📋 Documents à revoir
          </h1>
        </div>
        
        <!-- Contenu principal -->
        <div style="padding: 40px 32px;">
          <p style="color: #374151; font-size: 18px; line-height: 28px; margin: 0 0 24px 0;">
            Bonjour <strong>${fullName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 32px 0;">
            Nous avons examiné les documents que vous avez soumis, mais nous avons besoin de quelques ajustements 
            avant de pouvoir les approuver.
          </p>
          
          ${
            rejectionReason
              ? `
          <!-- Raison du rejet -->
          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #ef4444; border-radius: 12px; padding: 32px; margin: 32px 0;">
            <h3 style="color: #dc2626; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">
              Détails à corriger :
            </h3>
            <p style="color: #991b1b; font-size: 16px; margin: 0; line-height: 24px;">
              ${rejectionReason}
            </p>
          </div>
          `
              : ""
          }
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 24px 0;">
            Ne vous inquiétez pas ! Vous pouvez soumettre de nouveaux documents à tout moment. 
            Notre équipe sera ravie de les examiner rapidement.
          </p>
          
          <!-- Instructions -->
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 32px 0; border-radius: 4px;">
            <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0;">
              📝 Comment procéder
            </h3>
            <ul style="color: #92400e; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>Connectez-vous à votre compte AGROVIE</li>
              <li>Rendez-vous dans la section "Mes Documents"</li>
              <li>Téléchargez les documents corrigés</li>
              <li>Notre équipe les examinera dans les plus brefs délais</li>
            </ul>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 24px 0;">
            Si vous avez des questions, n'hésitez pas à contacter notre équipe de support. 
            Nous sommes là pour vous aider !
          </p>
        </div>
        
        <!-- Pied de page -->
        <div style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; text-align: center;">
            Merci pour votre patience et votre confiance.
          </p>
          <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
            © ${new Date().getFullYear()} AGROVIE - Tous droits réservés
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

interface DocumentStatusRequest {
  userId: string;
  email: string;
  full_name: string;
  status: "approved" | "rejected";
  rejectionReason?: string;
}

interface EmailSendResult {
  data?: { id?: string };
  error?: { message: string };
}

interface EnvVars {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  resendApiKey: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  const startTime: number = Date.now();

  try {
    // Gestion des requêtes CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Vérification de la méthode HTTP
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Méthode non autorisée",
          message: "Seules les requêtes POST sont acceptées",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            Allow: "POST, OPTIONS",
          },
        }
      );
    }

    // Validation des variables d'environnement
    const envVars: EnvVars = validateEnvironmentVariables();

    const resend: Resend = new Resend(envVars.resendApiKey);

    // Parsing et validation du body de la requête
    let requestData: DocumentStatusRequest;
    try {
      const contentType: string | null = req.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Content-Type doit être application/json");
      }
      requestData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Format de requête invalide",
          message: "Le body doit être un JSON valide",
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

    // Validation des données d'entrée
    validateInput(requestData);

    const { userId, email, full_name, status, rejectionReason } = requestData;

    console.log(
      `[INFO] Envoi d'email de statut de document pour:`,
      sanitizeForLog({
        userId,
        email,
        full_name,
        status,
      })
    );

    // Génération du template approprié
    const emailTemplate: string =
      status === "approved"
        ? generateApprovedEmailTemplate(full_name)
        : generateRejectedEmailTemplate(full_name, rejectionReason);

    const emailSubject: string =
      status === "approved"
        ? "✅ Vos documents ont été approuvés - AGROVIE"
        : "📋 Action requise : Documents à revoir - AGROVIE";

    // Envoi de l'email
    const { data: emailData, error: emailError }: EmailSendResult = await resend.emails.send({
      from: "AGROVIE <verification@mails.agrovie.africa>",
      to: email,
      subject: emailSubject,
      html: emailTemplate,
      tags: [
        {
          name: "type",
          value: "document_status",
        },
        {
          name: "status",
          value: status,
        },
        {
          name: "source",
          value: "supabase-edge-function",
        },
      ],
    });

    if (emailError) {
      console.error("[ERROR] Erreur envoi email:", emailError);
      throw new Error(
        `Impossible d'envoyer l'email de statut: ${emailError.message}`
      );
    }

    // Enregistrement de l'envoi dans la base de données (optionnel)
    // try {
    //   await supabase.from('email_logs').insert({
    //     user_id: userId,
    //     email_type: 'document_status',
    //     status: 'sent',
    //     email_id: emailData?.id,
    //     metadata: {
    //       document_status: status,
    //       rejection_reason: rejectionReason || null
    //     }
    //   });
    // } catch (logError) {
    //   console.warn('[WARNING] Impossible de logger l\'email:', logError);
    //   // Continue sans faire échouer la requête
    // }

    const processingTime: number = Date.now() - startTime;
    console.log(
      `[SUCCESS] Email de statut de document envoyé pour userId: ${userId} - Status: ${status} (${processingTime}ms)`
    );

    return new Response(
      JSON.stringify({
        message: `Email de ${status === "approved" ? "approbation" : "rejet"} envoyé avec succès`,
        email_id: emailData?.id,
        status: status,
        processing_time_ms: processingTime,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: unknown) {
    const processingTime: number = Date.now() - startTime;
    const errorMessage: string =
      error instanceof Error
        ? error.message
        : "Une erreur inconnue s'est produite";

    console.error(
      `[ERROR] Erreur dans la fonction de statut de document (${processingTime}ms):`,
      {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      }
    );

    // Détermination du code de statut approprié
    let statusCode: number = 500;
    if (
      errorMessage.includes("invalide") ||
      errorMessage.includes("requis") ||
      errorMessage.includes("Format")
    ) {
      statusCode = 400;
    } else if (errorMessage.includes("non autorisée")) {
      statusCode = 405;
    } else if (errorMessage.includes("variables d'environnement")) {
      statusCode = 500;
    }

    return new Response(
      JSON.stringify({
        error: "Erreur lors de l'envoi de l'email de statut",
        message: errorMessage,
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString(),
      }),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
