module.exports = {
    name: 'messageCreate',
    once: false,
    execute(message) {
        let variants = [
            "", "!", "!!", ".", "а", "-а", "?", "??", "аа", 
            ")", "))", ")))", "(((", "((", "("
        ];

        if ( variants.some(item => { 
            if (message.content.toLowerCase().endsWith("да" + item)) return true 
        })) {
            if (Math.random() > 0.98) message.reply('Пизда!'); // ~2% chance
        }
    }
};