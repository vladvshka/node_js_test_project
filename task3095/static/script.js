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
                <span>${option.label}</span>
                <span>${option.number}</span>
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
        const fieldsetNode = document.getElementsByTagName('fieldset')[0];

        for (const key in variants) {
            const text = variants[key];
            const inputNode = document.createElement('input');

            inputNode.setAttribute('type', 'radio');
            inputNode.setAttribute('name', 'group');
            inputNode.setAttribute('id', `${key}`);
            inputNode.setAttribute('value', `${key}`);

            const labelNode = document.createElement('label');
            labelNode.setAttribute('for', `${key}`);
            labelNode.innerText = text;

            fieldsetNode.appendChild(inputNode);
            fieldsetNode.appendChild(labelNode);
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
