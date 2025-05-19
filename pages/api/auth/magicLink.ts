import {headers} from "next/headers";
import {NextRequest, NextResponse} from "next/server";
interface MagicLinkRequest {
    client_id: string;
    client_secret: string;
    client_assertion_type: string;
    connection: string;
    email: string;
    send: string;
    authParams: {
        redirect_uri: string;
        scope: string;
    };
}

export const sendAuth0MagicLink = async (
    email: string,
    // partner: string,
    ip: string,
    lang: string,
) => {
    // const ip = headersList.get('x-forwarded-for'); 
    // const ip = request.socket.remoteAddress as string;
    // const email = request.data.email;
    // const lang = request.headers["content-language"] || "en";
    const clientId : string = process.env['AUTH0_CLIENT_ID'] as string;
    const clientSecret : string = process.env['AUTH0_CLIENT_SECRET'] as string;
    const hostURL : string = process.env['AUTH0_HOST'] as string;
    // const email = "yogiraj.tambake@liberis.com"

    const req: MagicLinkRequest = {
        client_id: clientId,
        client_secret: clientSecret,
        client_assertion_type:
            'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        connection: 'email',
        email: email,
        send: 'link',
        authParams: {
            redirect_uri: `http://localhost:3000/profile`, // Use when testing locally
            // redirect_uri: `https://${partner}.liberis.com/resume`,
            scope: 'openid email profile',
        },
    };
    try {
        const res = await fetch(
            `${hostURL}/passwordless/start`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'auth0-forwarded-for': ip,
                    'x-request-language': lang,
                    // 'X-Datadog-Trace-Id': traceId as string,
                    // 'X-Datadog-Parent-Id': spanId as string,
                    // 'X-Datadog-Origin': 'local',
                    // 'X-Datadog-Sampling-Priority': '1',
                },
                method: 'POST',
                body: JSON.stringify(req),
                cache: 'no-store',
            },
        );
        if (res.ok) {
            // For datadog dashboard
            console.log('Return-to-Journey-magic-link-sent');
        }else{
            console.log("Return-to-Journey-magic-link-not-sent -> ", res)
        };

        return new NextResponse(null, { status: res.status });
    } catch (error: any) {
        console.error(
            `Call to auth0 /passwordless/start' failed error: ${error.message}`,
        );
        switch (error.response?.status) {
            case 400:
                throw new Error(
                    `Failed to send magic link to email ${email} due to a bad request.`,
                );
            default:
                // this was NestedError in eevee
                throw new Error(`Failed to send magic link to email ${email}`, error);
        }
    }
};

export default async (request: NextRequest, res: NextResponse) => {

    // const headersList = await headers();
    const ip = request.headers['x-forwarded-for']; // || request.socket.remoteAddress;

    // const ip = request.headers['x-forwarded-for']; // || request.socket.remoteAddress;
    // const ip = headersList.get('x-forwarded-for'); // || request.socket.remoteAddress;
    // const { partner } = params;
    const body = JSON.parse(request.body.toString());
    const email = body.email;
    const lang = body.lang.split('-')[0] ?? 'en'

    if (!ip) throw new Error('client IP must not be null for magicLink');
    if (!email) throw new Error('email for LeadDb lookup must not be null');
    try {
        await sendAuth0MagicLink(email, ip, lang);
    } catch (e: any) {
        console.log('Error sending magic link:', e);
        res.status(500).send({error: e.message })
    }
    res.status(200).send({});
}

export async function POST(request: Request, { params }: any) {
    // const headersList = await headers();
    const ip = request.headers['x-forwarded-for']; // || request.socket.remoteAddress;
    // const { partner } = params;
    const data = JSON.parse(request.body.toString());
    const email = data.email;
    const lang = data.lang.split('-')[0] ?? 'en'

    if (!ip) throw new Error('client IP must not be null for magicLink');
    if (!email) throw new Error('email for LeadDb lookup must not be null');
    try {
        await sendAuth0MagicLink(email, ip, lang);
    } catch (e: any) {
        console.log('Error sending magic link:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return new NextResponse(null, { status: 200 });
}
