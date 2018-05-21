#!/usr/bin/env node

const sys   = require('os');
const fs    = require('fs');
const path  = require('path');
const _     = require('lodash');


class CryptoIpsum {

    constructor (options, words=null) {
        let defaultFile = path.resolve(path.join(__dirname, 'ipsum.txt'));
        this.defaultOptions = {
            output: {
                paragraphs: 2,
                min_words_sentence: 8,
                max_words_sentence: 20,
                min_paragraph_sentences: 4,
                max_paragraph_sentences: 8,
                min_clause_length: 1,
                max_clause_length: 4,
                clause_probability: 0.2,
                semicolon_probability: 0.1
            },
            file: defaultFile
        };
        if (typeof options !== 'object') {
            options = {};
        }
        this.options = _.merge({}, this.defaultOptions, options);
        if (words === null) {
            this.words = fs.readFileSync(this.options.file, { encoding: 'utf-8' }).split("\n");
        } else {
            this.words = words;
        }
    }

    ipsum (options) {
        let ipsumOptions = _.merge({}, this.options.output);
        if (typeof options === 'object') {
            ipsumOptions = _.merge(ipsumOptions, options);
        }
        let output = "";
        for (let paragraphs = 0; paragraphs < ipsumOptions.paragraphs; paragraphs++) {
            let sentences_in_graf = this.randInt(ipsumOptions.min_paragraph_sentences, ipsumOptions.max_paragraph_sentences);
            for (let sentences = 0; sentences < sentences_in_graf; sentences++) {
                let lastHadSemicolon = false;
                let semicolon = (sentences !== 0 && sentences+1 !== sentences_in_graf && Math.random() <= ipsumOptions.semicolon_probability);
                let words_in_sentence = this.randInt(ipsumOptions.min_words_sentence, ipsumOptions.max_words_sentence);
                for (let words = 0; words < words_in_sentence; words++) {
                    let inClause = false;
                    let word = this.randWord();
                    if (words === 0 && !lastHadSemicolon) {
                        word = word.charAt(0).toUpperCase() + word.substr(1);
                    }
                    output += word;
                    if (words >= (ipsumOptions.min_clause_length - 1) && words <= (ipsumOptions.max_clause_length - 1)) {
                        let isClause = (Math.random() <= ipsumOptions.clause_probability);
                        if (isClause && !inClause) {
                            output += ',';
                            inClause = true;
                        }
                    }
                    if (words !== words_in_sentence-1) {
                        output += " ";
                    }
                }
                if (semicolon) {
                    output += '; ';
                    lastHadSemicolon = true;
                } else {
                    lastHadSemicolon = false;
                    output += '. ';
                }
            }
            if (paragraphs < (ipsumOptions.paragraphs - 1)) {
                output += "\n\n";
            }
        }
        return output;
    }

    randInt (min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    randWord () {
        let choice = this.randInt(0, (this.words.length - 1));
        return this.words[choice];
    }

}


// CLI options
let makeOptionsObject = function(args) {
    let output_options = [
        'paragraphs',
        'min_words_sentence',
        'max_words_sentence',
        'min_paragraph_sentences',
        'max_paragraph_sentences',
        'min_clause_length',
        'max_clause_length',
        'clause_probability',
        'semicolon_probability'
    ];
    let options = {};
    for (let key in args) {
        if (args[key] !== null) {
            if (output_options.indexOf(key) !== -1 && args[key] !== null) {
                if (!options.output) {
                    options.output = {};
                }
                options.output[key] = args[key];
            }
            if (key === 'words_file') {
                options.file = args[key];
            }
        }
    }
    return options;
};

let main = function() {
    const ArgumentParser = require('argparse').ArgumentParser;
    let parser = new ArgumentParser({
        version: '1.0.1',
        addHelp: true,
        description: "A meaningless copy generator for hodlers."
    });
    parser.addArgument(['-p', '--paragraphs'], {
        type: 'int',
        help: 'Number of paragraphs to generate.'
    });
    parser.addArgument('-f', {
        type: 'string',
        dest: 'words_file',
        help: 'Path to word file (default: ipsum.txt)'
    });
    parser.addArgument('--min-words-sentence', {
        type: 'int',
        help: 'Minimum number of words in a sentence'
    });
    parser.addArgument('--max-words-sentence', {
        type: 'int',
        help: 'Maximum number of words in a sentence'
    });
    parser.addArgument('--min-paragraph-sentences', {
        type: 'int',
        help: 'Minimum sentences in a paragraph'
    });
    parser.addArgument('--max-paragraph-sentences', {
        type: 'int',
        help: 'Maximum sentences in a paragraph'
    });
    parser.addArgument('--min-clause-length', {
        type: 'int',
        help: 'Minimum number of words in a clause'
    });
    parser.addArgument('--max-clause-length', {
        type: 'int',
        help: 'Maximum number of words in a clause'
    });
    parser.addArgument('--clause-probability', {
        type: 'float',
        help: 'FP probability of clause occurrence (0-1.0)'
    });
    parser.addArgument('--semicolon-probability', {
        type: 'float',
        help: 'FP probability of semicolon occurrence (0-1.0)'
    });

    // coerce argparse into options object 
    let opts = makeOptionsObject(parser.parseArgs());
    let inst = new CryptoIpsum(opts);
    let output = inst.ipsum();
    console.log(output);
};

module.exports = CryptoIpsum;

if (typeof require !== 'undefined' && require.main === module) {
    main();
}
