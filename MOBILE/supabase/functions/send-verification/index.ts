import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Resend } from 'npm:resend@2.0.0';
// Configuration des en-têtes CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};
// Fonction de validation des entrées
function validateInput(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Données de requête invalides');
  }
  if (!data.userId || typeof data.userId !== 'string' || data.userId.trim() === '') {
    throw new Error('userId est requis et doit être une chaîne non vide');
  }
  if (!data.email || typeof data.email !== 'string') {
    throw new Error('email est requis et doit être une chaîne');
  }
  // Validation simple de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Format d\'email invalide');
  }
  if (!data.full_name || typeof data.full_name !== 'string' || data.full_name.trim() === '') {
    throw new Error('full_name est requis et doit être une chaîne non vide');
  }
  return true;
}
// Fonction de validation des variables d'environnement
function validateEnvironmentVariables() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL n\'est pas définie dans les variables d\'environnement');
  }
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY n\'est pas définie dans les variables d\'environnement');
  }
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY n\'est pas définie dans les variables d\'environnement');
  }
  return {
    supabaseUrl,
    supabaseServiceRoleKey,
    resendApiKey
  };
}
// Fonction pour sanitiser les données pour les logs
function sanitizeForLog(data) {
  const sanitized = {
    ...data
  };
  if (sanitized.email) {
    // Masquer une partie de l'email pour les logs
    const [localPart, domain] = sanitized.email.split('@');
    sanitized.email = `${localPart.substring(0, 2)}***@${domain}`;
  }
  return sanitized;
}
// Template d'email HTML amélioré
function generateEmailTemplate(fullName, code) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vérification de votre adresse email - AGROVIE</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- En-tête -->
        <div style="background: linear-gradient(135deg, #166534 0%, #22c55e 100%); padding: 40px 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
            Bienvenue sur AGROVIE !
          </h1>
        </div>
        
        <!-- Contenu principal -->
        <div style="padding: 40px 32px;">
          <p style="color: #374151; font-size: 18px; line-height: 28px; margin: 0 0 24px 0;">
            Bonjour <strong>${fullName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 32px 0;">
            Merci de vous être inscrit sur AGROVIE. Pour finaliser votre inscription et sécuriser votre compte, 
            veuillez saisir le code de vérification suivant dans l'application :
          </p>
          
          <!-- Code de vérification -->
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #166534; border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center;">
            <p style="color: #166534; font-size: 36px; font-weight: 800; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
              ${code}
            </p>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 32px 0; border-radius: 4px;">
            <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
              ⚠️ <strong>Important :</strong> Ce code expire dans 15 minutes pour des raisons de sécurité.
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 24px 0;">
            Si vous n'avez pas demandé cette vérification, veuillez ignorer cet email. 
            Votre compte reste sécurisé.
          </p>
          
          <!-- Conseils de sécurité -->
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 32px 0;">
            <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 12px 0;">
              💡 Conseils de sécurité
            </h3>
            <ul style="color: #374151; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>Ne partagez jamais ce code avec personne</li>
              <li>AGROVIE ne vous demandera jamais votre code par téléphone</li>
              <li>Ce code n'est valable que pour cette session</li>
            </ul>
          </div>
        </div>
        
        <!-- Pied de page -->
        <div style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; text-align: center;">
            Ceci est un message automatique, merci de ne pas répondre à cet email.
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
Deno.serve(async (req)=>{
  const startTime = Date.now();
  try {
    // Gestion des requêtes CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    // Vérification de la méthode HTTP
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Méthode non autorisée',
        message: 'Seules les requêtes POST sont acceptées'
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Allow': 'POST, OPTIONS'
        }
      });
    }
    // Validation des variables d'environnement
    const envVars = validateEnvironmentVariables();
    // Initialisation des clients
    const supabase = createClient(envVars.supabaseUrl, envVars.supabaseServiceRoleKey, {
      auth: {
        persistSession: false
      },
      global: {
        headers: {
          'User-Agent': 'AGROVIE-VerificationService/1.0'
        }
      }
    });
    const resend = new Resend(envVars.resendApiKey);
    // Parsing et validation du body de la requête
    let requestData;
    try {
      const contentType = req.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Content-Type doit être application/json');
      }
      requestData = await req.json();
    } catch (parseError) {
      return new Response(JSON.stringify({
        error: 'Format de requête invalide',
        message: 'Le body doit être un JSON valide'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validation des données d'entrée
    validateInput(requestData);
    const { userId, email, full_name } = requestData;
    console.log(`[INFO] Début de génération du code de vérification pour:`, sanitizeForLog({
      userId,
      email,
      full_name
    }));
    // Génération et stockage du code de vérification
    const { data: codeData, error: dbError } = await supabase.rpc('generate_verification_code', {
      user_id: userId
    });
    if (dbError) {
      console.error('[ERROR] Erreur base de données:', dbError);
      throw new Error(`Impossible de générer le code de vérification: ${dbError.message}`);
    }
    if (!codeData) {
      console.error('[ERROR] Code non généré par la fonction RPC');
      throw new Error('Aucun code de vérification généré');
    }
    console.log(`[INFO] Code de vérification généré avec succès pour userId: ${userId}`);
    // Envoi de l'email avec gestion d'erreur améliorée
    const emailTemplate = generateEmailTemplate(full_name, codeData);
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'AGROVIE <verification@mails.agrovie.africa>',
      to: email,
      subject: '🔐 Vérifiez votre adresse email - AGROVIE',
      html: emailTemplate,
      // Ajout de tags pour le tracking
      tags: [
        {
          name: 'type',
          value: 'verification'
        },
        {
          name: 'source',
          value: 'supabase-edge-function'
        }
      ]
    });
    if (emailError) {
      console.error('[ERROR] Erreur envoi email:', emailError);
      // Tentative de suppression du code si l'email a échoué
      try {
        await supabase.from('verification_codes').delete().eq('user_id', userId).eq('code', codeData.code);
        console.log(`[INFO] Code supprimé après échec d'envoi email pour userId: ${userId}`);
      } catch (cleanupError) {
        console.error('[ERROR] Impossible de nettoyer le code après échec email:', cleanupError);
      }
      throw new Error(`Impossible d'envoyer l'email de vérification: ${emailError.message}`);
    }
    const processingTime = Date.now() - startTime;
    console.log(`[SUCCESS] Code de vérification envoyé avec succès pour userId: ${userId} (${processingTime}ms)`);
    return new Response(JSON.stringify({
      message: 'Code de vérification envoyé avec succès',
      email_id: emailData?.id,
      processing_time_ms: processingTime
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite';
    console.error(`[ERROR] Erreur dans la fonction de vérification (${processingTime}ms):`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    // Détermination du code de statut approprié
    let statusCode = 500;
    if (errorMessage.includes('invalide') || errorMessage.includes('requis') || errorMessage.includes('Format')) {
      statusCode = 400;
    } else if (errorMessage.includes('non autorisée')) {
      statusCode = 405;
    } else if (errorMessage.includes('variables d\'environnement')) {
      statusCode = 500;
    }
    return new Response(JSON.stringify({
      error: 'Erreur lors de l\'envoi du code de vérification',
      message: errorMessage,
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
