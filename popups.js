document.addEventListener('DOMContentLoaded', function () {
    const filterInput = document.getElementById('filterInput');
    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const filtersList = document.getElementById('filtersList');
    const statusMessage = document.getElementById('statusMessage');
  
    let filtersSet = new Set(); // Using a Set to ensure uniqueness
  
    filterInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        addFilter();
      }
    });
  
    addBtn.addEventListener('click', addFilter);
  
    function addFilter() {
      const filterToSave = filterInput.value.trim();
      if (filterToSave) {
        if (!filtersSet.has(filterToSave)) {
          filtersSet.add(filterToSave);
          displaySavedFilters();
          statusMessage.textContent = 'Filter saved!';
          setTimeout(() => {
            statusMessage.textContent = '';
          }, 3000);
          filterInput.value = ''; // Clear input field after adding
        } else {
          statusMessage.textContent = 'Duplicate filter!';
          setTimeout(() => {
            statusMessage.textContent = '';
          }, 3000);
        }
      }
    }
  
    clearBtn.addEventListener('click', function () {
      filtersSet.clear();
      filtersList.innerHTML = '';
    });
  
    function displaySavedFilters() {
      filtersList.innerHTML = '';
      filtersSet.forEach(function (filter) {
        const listItem = document.createElement('li');
        listItem.textContent = filter;
        filtersList.appendChild(listItem);
      });
    }
  
    displaySavedFilters();
  });
  