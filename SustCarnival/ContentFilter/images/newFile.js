document.addEventListener('DOMContentLoaded', function () {
  const quoteElement = document.getElementById('quote');
  const generateBtn = document.getElementById('generateBtn');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const quotesList = document.getElementById('quotesList');
  const statusMessage = document.getElementById('statusMessage');

  // Function to get a random Stoic quote
  function getStoicQuote() {
    const quotes = [
      //  Certainly! Here are the Stoic quotes formatted as requested, with each quote and its author enclosed in a single set of quotation marks and separated by commas:
      "“The best revenge is to be unlike him who performed the injustice.” — Marcus Aurelius",
      "“We suffer more often in imagination than in reality.” — Seneca",
      "“We cannot choose our external circumstances, but we can always choose how we respond to them.” — Epictetus",
      "“The key is to keep company only with people who uplift you, whose presence calls forth your best.” — Epictetus",
      "“The whole future lies in uncertainty: live immediately.” — Seneca",
      "“If it is not right, do not do it. If it is not true, do not say it.” — Marcus Aurelius",
      "“Wealth consists not in having great possessions, but in having few wants.” — Epictetus",
      "“The happiness of your life depends upon the quality of your thoughts.” — Marcus Aurelius",
      "“Difficulty shows what men are.” — Epictetus",
      "“It is not the man who has too little, but the man who craves more, that is poor.” — Seneca",
      "“The only wealth which you will keep forever is the wealth you have given away.” — Marcus Aurelius",
      "“First say to yourself what you would be; and then do what you have to do.” — Epictetus",
      "“True happiness is... to enjoy the present, without anxious dependence upon the future.” — Seneca",
      "“The soul becomes dyed with the color of its thoughts.” — Marcus Aurelius",
      "“We should always be asking ourselves: 'Is this something that is, or is not, in my control?'” — Epictetus",
      "“Fate leads the willing and drags along the reluctant.” — Seneca",
      "“It is not the man who has too little that is poor, but the one who hankers after more.” — Seneca",
      "“No person has the power to have everything they want, but it is in their power not to want what they don't have, and to cheerfully put to good use what they do have.” — Seneca",
      "“The greatest obstacle to living is expectancy, which hangs upon tomorrow and loses today.” — Seneca",
      "“Your days are numbered. Use them to throw open the windows of your soul to the sun.” — Marcus Aurelius",
      "“Happiness and freedom begin with a clear understanding of one principle: some things are within our control, and some things are not.” — Epictetus",
      "“Man conquers the world by conquering himself.” — Zeno of Citium"
      // Add more quotes
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
