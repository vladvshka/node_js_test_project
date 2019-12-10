(async() => {
    // Removes nodes with current statistics
    const unsetCurrentNodes = () => {
        const statElements = document.getElementsByClassName('statElement');
        while(statElements.length > 0){
            statElements[0].parentNode.removeChild(statElements[0]);
        }
    }
    
    // Renders statistics from an object.
    const renderStatistics = (statistics) => {
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

    // Shows download buttons.
    const showDownloadButtons = () => {
        const downloadsWrapper = document.getElementById('downloadsWrapper');
        downloadsWrapper.style.display = 'block';
    }
    
    // Processes vote button click
    const handleVoteClick = async (e) => {
        e.preventDefault();

        const form = document.getElementById('form');

        const formData = new FormData(form);
        
        if (!formData.has('group')) {
            return;
        }

        try {
            const voteResponse = await fetch('/vote', {
                method: 'POST',
                body: formData,
            });
    
            if (voteResponse.ok) {        
                await updateStatistics();
            };

        } catch (error) {
            console.error('error', error);
        }
    };

    // Renders all options.
    const renderVariants = (variants) => {
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

    // Download stat -> Render stat.
    const updateStatistics = async () => {
        const statisticsResponse = await fetch('/stat');
        
        if (statisticsResponse.ok) {        
            const statistics = await statisticsResponse.json();
            renderStatistics(statistics);
        };
    };

    // Entry point.
    try {
        const variantsResponse = await fetch('/variants');

        if (variantsResponse.ok) {
            const variants = await variantsResponse.json();
            renderVariants(variants);

            await updateStatistics();

            showDownloadButtons();
        }

        document.getElementById('form').addEventListener('submit', handleVoteClick);
    } catch (error) {
        console.error('error', error);
    }
})();
