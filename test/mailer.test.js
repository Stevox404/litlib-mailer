process.env.NODE_ENV = 'test';
const { Mailer } = require('../index');
const { expect } = require('chai');

describe.only('Mailer', function () {
    this.timeout(5000);

    it('Should initialize Mailer using .env params', async () => {
        Mailer.reset();
        process.env.EMAIL_NAME='name'
        await Mailer.init();
        const email = new Mailer();
        expect(email.getConfig().username).to.be.equal('name');
    });

    it('Should initialize Mailer using passed params', async () => {
        Mailer.reset();
        await Mailer.init({
            username: 'Foo',
        });
        const email = new Mailer();
        expect(email.getConfig().username).to.be.equal('Foo');
    });

    it('Should auto initialize Mailer when sending if possible', async () => {
        Mailer.reset();
        process.env.EMAIL_NAME='Batman'
        const email = new Mailer();
        await email.send({
            to: 'jason@milion.com',
            subject: 'BOY!',
            html: '<b>BOY!</b>'
        });
        expect(email.getConfig().username).to.be.equal('Batman');
    });

    it('Should send an email', async () => {
        await Mailer.init();
        const email = new Mailer();
        const info = await email.send({
            to: 'jason@milion.com',
            subject: 'BOY!',
            html: '<b>BOY!</b>'
        });
        expect(info).to.not.be.null;
    });
});