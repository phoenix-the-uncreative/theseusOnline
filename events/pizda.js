module.exports = {
    name: 'messageCreate',
    once: false,
    execute(message) {
        if (message.author.bot) return;

        let punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
        let expRE = /(^|\s)(да)(\s|$)$/g; // scary regexes

        let filteredMessage = message.content.replace(punctRE, '').toLowerCase(); // Exclude any punctuation in further testing

        if ((expRE.test(filteredMessage)) && (Math.random() >= 0.99)) {
            message.reply('Пизда!'); // 1% chance
        };
    }
};