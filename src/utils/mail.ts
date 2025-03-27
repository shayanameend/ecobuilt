import { env } from "@/lib/env";
import { nodemailerTransporter } from "@/lib/nodemailer";

async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  nodemailerTransporter.sendMail(
    {
      from: {
        name: env.APP_NAME,
        address: env.APP_SUPPORT_EMAIL,
      },
      to,
      subject,
      text,
    },
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}

export { sendEmail };
