const menu = document.querySelector(".menu-icon");
const sidebar = document.getElementById("categorySidebar");
const close = document.querySelector(".close-icon");
const list = document.getElementById("categoryList");
const grid = document.getElementById("categories-grid");
const catSec = document.querySelector(".categories-section");
const mealsSec = document.getElementById("meals-by-category");
const descriptionDiv = document.getElementById("description");
const desHeader = document.getElementById("desHeader");
const mealsGrid = document.getElementById("meals-grid");
const searchForm = document.querySelector(".searchForm");
const searchInput = document.getElementById("searchInput");
const detailsSec = document.getElementById("meal-details");
const detailsContainer = document.getElementById("meal-details-container");
const backButton = document.getElementById("back-button");

async function getCategories() {
  list.innerHTML = "";
  try {
    const res = await fetch(
      "https://www.themealdb.com/api/json/v1/1/categories.php"
    );
    const data = await res.json();
    if (data.categories) {
      data.categories.forEach((c) => {
        const li = document.createElement("li");
        li.textContent = c.strCategory;
        li.dataset.category = c.strCategory;
        list.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
}

menu.addEventListener("click", () => {
  sidebar.classList.add("show");
  getCategories();
});

close.addEventListener("click", () => {
  sidebar.classList.remove("show");
});

document.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && !menu.contains(e.target)) {
    sidebar.classList.remove("show");
  }
});

async function showCategories() {
  try {
    const res = await fetch(
      "https://www.themealdb.com/api/json/v1/1/categories.php"
    );
    const data = await res.json();

    if (data.categories) {
      data.categories.forEach((c) => {
        const card = document.createElement("div");
        card.className = "category-card";
        card.dataset.category = c.strCategory;
        card.innerHTML = `
          <img src="${c.strCategoryThumb}">
          <div class="category-title">${c.strCategory}</div>
        `;
        grid.appendChild(card);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showCategories();
  history.replaceState({ view: 'categories' }, '', '#categories');
});

async function getMealsByCategory(category) {
  mealsGrid.innerHTML = "";
  try {
    const [res, categoryRes] = await Promise.all([
      fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`),
      fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`)
    ]);
    const [data, categories] = await Promise.all([
      res.json(),
      categoryRes.json()
    ]);
    if (data.meals) {
      data.meals.forEach((meal) => {
        const card = document.createElement("div");

        desHeader.textContent = ` ${category}`;
        const description = categories.categories.find(cat => cat.strCategory === category)?.strCategoryDescription || "";
        descriptionDiv.textContent = description;
        card.className = "meal-card";
        card.dataset.id = meal.idMeal;
        card.innerHTML = `
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <div class="meal-title">${meal.strMeal}</div>
        `;
        mealsGrid.appendChild(card);
      });
    } else {
      mealsGrid.innerHTML = "<h2>No meals found for this category.</h2>";
    }
  } catch (err) {
    console.error(err);
  }
}

grid.addEventListener('click', (e) => {
  const categoryCard = e.target.closest('.category-card');
  if (categoryCard) {
    const categoryName = categoryCard.dataset.category;
    catSec.classList.add("hidden");
    mealsSec.classList.remove("hidden");
    getMealsByCategory(categoryName);
    history.pushState({ view: 'meals', category: categoryName }, '', `#category-${categoryName}`);
  }
});

list.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    const categoryName = e.target.dataset.category;
    sidebar.classList.remove("show");
    catSec.classList.add("hidden");
    mealsSec.classList.remove("hidden");
    getMealsByCategory(categoryName);
    history.pushState({ view: 'meals', category: categoryName }, '', `#category-${categoryName}`);
  }
});

async function getMealsBySearch(name) {
  mealsGrid.innerHTML = "";
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`
    );
    const data = await res.json();
    if (data.meals) {
      data.meals.forEach((meal) => {
        const card = document.createElement("div");
        card.className = "meal-card";
        card.dataset.id = meal.idMeal;
        card.innerHTML = `
          <img src="${meal.strMealThumb}">
          <div class="meal-title">${meal.strMeal}</div>
        `;
        mealsGrid.appendChild(card);
      });
    } else {
      mealsGrid.innerHTML = "<h2>No meals found for this search.</h2>";
    }
  } catch (err) {
    console.error(err);
  }
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    catSec.classList.add("hidden");
    mealsSec.classList.remove("hidden");
    getMealsBySearch(searchTerm);
    history.pushState({ view: 'meals', search: searchTerm }, '', `#search-${searchTerm}`);
  }
});

mealsGrid.addEventListener("click", (e) => {
  const mealCard = e.target.closest(".meal-card");
  if (mealCard) {
    const mealId = mealCard.dataset.id;
    getMealDetails(mealId);
    mealsSec.classList.add("hidden");
    detailsSec.classList.remove("hidden");
    history.pushState({ view: 'details', id: mealId }, '', `#meal-${mealId}`);
  }
});

async function getMealDetails(id) {
  detailsContainer.innerHTML = "";
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    const meal = data.meals[0];

    if (meal) {
      const ingredientsList = [];
      const measuresList = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          ingredientsList.push(ingredient);
          measuresList.push(measure);
        }
      }

      const tags = meal.strTags ? meal.strTags.split(',') : [];

      const instructions = meal.strInstructions ? meal.strInstructions.split('. ').filter(step => step.trim() !== '') : [];


      const mealTopDetailsHTML = `
      <div class="meal-top">
      
            <div class="meal-details-image">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            </div>
    
            <div class="meal-details-info">
              <h2>${meal.strMeal}</h2>
              <h1 class="area-text">Area: ${meal.strArea || "—"}</h1>
              <p class="category-text">Category: ${meal.strCategory || "—"}</p>
              ${meal.strSource ? `<p><a class="source-link" href="${meal.strSource}" target="_blank" rel="noopener noreferrer">Source</a></p>` : ""}
              <div class="meal-details-tags">
                ${tags.length > 0 ? '<h3>Tags</h3>' : ''}
                ${tags.map(t => `<span class="tag">${t}</span>`).join("")}
                  <div class="ingredients-measures-box" aria-label="Ingredients and Measures">
              <h3>Ingredients & Measures</h3>
              <ul class="details-list">
                ${ingredientsList.map((ing, idx) => `<li>${ing} - ${measuresList[idx] || "-"}</li>`).join("")}
              </ul>
            </div>
              </div>
            </div >
          </div >
      `;
      const bottomHtml =
        `<div class="meal-bottom">
          
    
            <div class="details-instructions" aria-label="Instructions">
              <h3>Instructions</h3>
          ${instructions.map(ins => `<li><div>${ins.endsWith('.') ? ins : ins + '.'}</div></li>`).join("")}
        </ul >
            </div >
          </div >
        `;
      detailsContainer.innerHTML = mealTopDetailsHTML + bottomHtml;
    }
  } catch (err) {
    console.error(err);
  }
}

backButton.addEventListener('click', (e) => {
  e.preventDefault();
  history.back();
});

window.addEventListener('popstate', (e) => {
  const state = e.state;
  if (state) {
    if (state.view === 'categories') {
      mealsSec.classList.add("hidden");
      detailsSec.classList.add("hidden");
      catSec.classList.remove("hidden");
    } else if (state.view === 'meals') {
      detailsSec.classList.add("hidden");
      catSec.classList.add("hidden");
      mealsSec.classList.remove("hidden");
      if (state.category) {
        getMealsByCategory(state.category);
      } else if (state.search) {
        getMealsBySearch(state.search);
      }
    } else if (state.view === 'details') {
      mealsSec.classList.add("hidden");
      catSec.classList.add("hidden");
      detailsSec.classList.remove("hidden");
      getMealDetails(state.id);
    }
  } else {
    mealsSec.classList.add("hidden");
    detailsSec.classList.add("hidden");
    catSec.classList.remove("hidden");
  }
});
