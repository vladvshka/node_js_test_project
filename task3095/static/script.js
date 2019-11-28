(async() => {
    const unsetCurrentNodes = () => {
        const statElements = document.getElementsByClassName('statElement');
        while(statElements.length > 0){
            statElements[0].parentNode.removeChild(statElements[0]);
        }
    }
    
    const setUpStatistics = (statistics) => {
        console.log('statistics', statistics);
        const statisticsWrapper = document.getElementById('statisticsWrapper');
        statisticsWrapper.style.display = 'block';

        unsetCurrentNodes();

        for (const key in statistics) {
            const option = statistics[key];

            const newElement = document.createElement('div');

            newElement.setAttribute('class', 'statElement');

            newElement.innerHTML = `
                <span class='stat'>${option.label}: </span>
                <span class='num'>${option.number}</span>
            `;

            const statisticsHeader = document.getElementById('statisticsHeader');
            
            statisticsHeader.parentNode.insertBefore(newElement, statisticsHeader.nextSibling);
        }
    };
    
    const handleVoteClick = async (e) => {
        e.preventDefault();

        const form = document.getElementById('form');

        const formData = new FormData(form);
        
        if (!formData.has("group")) {
            return;
        }

        try {
            const statisticsResponse = await fetch('/vote', {
                method: 'POST',
                body: formData,
            });
    
            if (statisticsResponse.ok) {        
                const statistics = await statisticsResponse.json();
                setUpStatistics(statistics);
            }
        } catch (error) {
            console.error('error', error);
        }
    };

    const setUpVariants = (variants) => {
        const fieldsetNode = document.getElementsByTagName('ul')[0];

        for (const key in variants) {
            const text = variants[key];
            const liNode = document.createElement('li');
            const inputNode = document.createElement('input');
            const labelNode = document.createElement('label');
            const divNode = document.createElement('div');

            inputNode.setAttribute('type', 'radio');
            inputNode.setAttribute('name', 'group');
            inputNode.setAttribute('id', `${key}`);
            inputNode.setAttribute('value', `${key}`);
            labelNode.setAttribute('for', `${key}`);
            divNode.setAttribute('class', 'check');

            labelNode.innerText = text;

            liNode.appendChild(inputNode);
            liNode.appendChild(labelNode);
            liNode.appendChild(labelNode);

            fieldsetNode.appendChild(liNode);
        }
    };

    try {
        const variantsResponse = await fetch('/variants');

        if (variantsResponse.ok) {
            const variants = await variantsResponse.json();
            setUpVariants(variants);
        }

        document.getElementById('form').addEventListener('submit', handleVoteClick);
    } catch (error) {
        console.error('error', error);
    }
})();
