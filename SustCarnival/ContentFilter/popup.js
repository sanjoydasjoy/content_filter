document.addEventListener('DOMContentLoaded', function () {
  // const quoteElement = document.getElementById('quote');
  // const generateBtn = document.getElementById('generateBtn');
  const filterElement = document.getElementById('filter');
  const addBtn = document.getElementById('addBtn');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const filterList = document.getElementById('filterList');
  // const quotesList = document.getElementById('quotesList');
  const statusMessage = document.getElementById('statusMessage');

  // Function to get a random Stoic quote
  function getStoicQuote() {
    const quotes = [
"We should not, like sheep, follow the herd of creatures in front of us."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Event listener for generating a new quote
  generateBtn.addEventListener('click', function () {
    const quote = getStoicQuote();
    quoteElement.textContent = quote;
  });

  // Event listener for saving a quote
  saveBtn.addEventListener('click', function () {
    const quoteToSave = quoteElement.textContent;
    let savedQuotes = JSON.parse(localStorage.getItem('savedQuotes')) || [];
    savedQuotes.push(quoteToSave);
    localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));

    statusMessage.textContent = 'Filter Added!';
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 3000);

    displaySavedQuotes();
  });

  // Event listener for clearing all quotes
  clearBtn.addEventListener('click', function () {
    localStorage.removeItem('savedQuotes');
    quotesList.innerHTML = '';
  });

  // Function to display saved quotes
  function displaySavedQuotes() {
    quotesList.innerHTML = '';
    let savedQuotes = JSON.parse(localStorage.getItem('savedQuotes')) || [];
    savedQuotes.forEach(function (quote) {
      const listItem = document.createElement('li');
      listItem.textContent = quote;
      quotesList.appendChild(listItem);
    });
  }

  // Display saved quotes on popup load
  displaySavedQuotes();
});

