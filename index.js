const nodemailer = require('nodemailer');

require('dotenv').config();

let initializedEmail;

module.exports.Mailer = Mailer;

// TODO templates

/**
 * Constructor for Mailer.
 */
function Mailer() {
    /** @type {import('nodemailer').Transporter} */
    let { transporter, config } = initializedEmail || {};

    async function tryInit() {
        if (!transporter || !config) {
            initializedEmail = await init();
            if (!initializedEmail) {
                throw new Error('Mailer not initialized');
            }
            ({ transporter, config } = initializedEmail);
        }
    }



    /**
     * Send email
     * @param {import('nodemailer/lib/mailer').Options} data
     * @param {string} data.username
     */
    this.send = async function (data) {
        await tryInit();
        const username = data.username || config.username;
        if (!data.from && username) {
            data.from = `"${username}" ${config.email}`;
        }
        if (data.html) {
            const { footer } = config;
            footer && (data.html += footer);
        }

        /** @type {import('nodemailer').SentMessageInfo} info*/
        const info = await transporter.sendMail(data);
    
        // Testing
        if (process.env.NODE_ENV === 'test' && process.env.EMAIL_HOST === 'smtp.ethereal.email') {
            console.info(nodemailer.getTestMessageUrl(info));
        }

        return info;
    }

    if (process.env.NODE_ENV === 'test'  && process.env.EMAIL_HOST === 'smtp.ethereal.email') {
        /** @param {import('nodemailer').SentMessageInfo} info*/
        this.getTestMessageUrl = function (info) {
            return nodemailer.getTestMessageUrl(info);
        }
    }

    this.getConfig = function () {
        return JSON.parse(JSON.stringify(config));
    }
}

Mailer.init = async function (newConfig) {
    initializedEmail = await init(newConfig);
};

Mailer.reset = function () {
    initializedEmail = undefined;
}


/**
 * @param {EmailConfig} newConfig 
 */
async function init(newConfig = {}) {

    const config = {
        username: process.env.EMAIL_NAME,
        email: process.env.EMAIL_ADDRESS,
        transportOpts: {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        },
        ...(newConfig.extendConfig && initializedEmail.config),
        ...newConfig,
    }
    delete config.extendConfig;

    // Testing
    if (process.env.NODE_ENV === 'test' && process.env.EMAIL_HOST === 'smtp.ethereal.email') {
        const testAccount = await nodemailer.createTestAccount();
        config.transportOpts.auth.user = testAccount.user;
        config.transportOpts.auth.pass = testAccount.pass;
    }

    const transporter = await nodemailer.createTransport(config.transportOpts)
    // await transporter.verify()
    return { transporter, config };
}





/**
 * @typedef EmailConfig
 * @property {string} username - defaults to env EMAIL_NAME
 * @property {string} email - defaults to env EMAIL_ADDRESS
 * @property {string} footer - HTML/Text to be appended to every email
 * @property {import('nodemailer/lib/smtp-transport')} transportOpts
 */