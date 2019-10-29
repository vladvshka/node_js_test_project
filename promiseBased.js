(() =>{
    const URL = 'https://fe.it-academy.by/Examples/words_tree/';
    const ROOT_FILE_NAME = 'root.txt';

    let resultingPhrase = '';

    function renderPhrase() {
        const renderNode = document.getElementById('promise-text');
        renderNode.innerHTML = resultingPhrase;
        console.log('Promise resultingPhrase :', resultingPhrase);
    }

    function isJsonValidArray(structure) {
        if (typeof structure !== 'string') {
            return false;
        }
        try {
            const result = JSON.parse(structure);
            const type = Object.prototype.toString.call(result);

            return type === '[object Array]';
        } catch (error) {
            return false;
        }
    };

    function generateText(fileName) {
        return fetch(`${URL}${fileName}`)
            .then(function(response) {
                if (response.ok) {
                    return response.text();
                }
                return null;
            })
            .then(function(responseText) { 
                if (isJsonValidArray(responseText)) {
                    const data = JSON.parse(responseText);

                    // Promise.all does not preserve order, so I used reduce pattern.
                    return data.reduce(function(accum, file) {
                        return accum.then(function() {
                            return generateText(file)
                        });
                    }, Promise.resolve());
                } else if (typeof responseText === 'string') {
                    resultingPhrase += ` ${responseText}`;
                    return;
                }
            })
            .catch(function(error) {
                console.error('error', error);
            });
    };

    generateText(ROOT_FILE_NAME).then(function() {
        renderPhrase();
    });
})();