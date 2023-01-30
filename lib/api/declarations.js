var fs = require('fs');

var walkPathBase = './lib/api/declarations/api/bitbybit';
var walkPathInputs = './lib/api/declarations/api/inputs';

let completeDeclarations = '';

var walk = function (dir, done) {
    fs.readdir(dir, function (error, list) {
        if (error) {
            return done(error);
        }

        var i = 0;

        (function next () {
            var file = list[i++];

            if (!file) {
                return done(null);
            }
            
            file = dir + '/' + file;
            
            fs.stat(file, function (error, stat) {
        
                if (stat && stat.isDirectory()) {
                    walk(file, function (error) {
                        next();
                    });
                } else {
                    // do stuff to file here
                    try {  
                        var data = fs.readFileSync(file, 'utf8');
                        completeDeclarations += simplifyDeclaration(data.toString());

                    } catch(e) {
                        console.log('Error:', e.stack);
                    }

                    next();
                }
            });
        })();
    });
};


walk(walkPathBase, ()=> {
    fs.writeFileSync('./declarationsBase.ts', `export const baseDeclarations = \`${completeDeclarations}\`;
`, 'utf8', ()=> {
    });
completeDeclarations = '';
    walk(walkPathInputs, ()=> {
        fs.writeFileSync('./declarationsInputs.ts', `export const inputDeclarations = \`${completeDeclarations}\`;
    `, 'utf8', ()=> {
        });
    completeDeclarations = '';
    });
});



function simplifyDeclaration(declaration) {
    // declaration files for monaco don't need to export anything
    declaration = declaration.replace(/export /g, '');
    // remove all html image data
    const arrayOfLines = declaration.match(/[^\r\n]+/g);
    const noHtml = arrayOfLines.filter(line =>
        !(line.includes('<div>') || line.includes('<img') || line.includes('</div>') || line.includes('import') || line.includes('export '))
    );
    const remainder = noHtml.join('\n');
    return remainder;
}