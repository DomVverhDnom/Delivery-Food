'use strict';
import Swiper from 'https://unpkg.com/swiper/swiper-bundle.esm.browser.min.js';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const buttonCloseAuth = document.querySelector('.close-auth');
const loginForm = document.querySelector('#loginForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const restaurantRating = document.querySelector('.rating ');
const restaurantPrice = document.querySelector('.price' );
const restaurantCategory = document.querySelector('.category'); 
const inputSearch = document.querySelector('.input-search');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const clearCart = document.querySelector('.clear-cart');
let login = localStorage.getItem('delivery');

const cart = JSON.parse(localStorage.getItem(`delivery_${login}`)) || [];

function saveCart(){
  localStorage.setItem(`delivery_${login}`, JSON.stringify(cart));
}

function downloadCart(){
  if (localStorage.getItem(`delivery_${login}`)){
    const data = JSON.parse(localStorage.getItem(`delivery_${login}`));
    cart.push(...data)
  }
}

const getData = async function (url){
  const  response =  await fetch(url);
  if(!response.ok){
    throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}!`)
  }
  return await response.json();
};

function toggleModal() {
  modal.classList.toggle("is-open");
}

function toggleModalAuth(){
  modalAuth.classList.toggle('is-open');
  loginInput.style.borderColor = "";
  if(modalAuth.classList.contains('is-open')){
    disabledScroll();
  } else {
    enableScroll();
  }

}

function returnMain(){
  containerPromo.classList.remove('hide')
  restaurants.classList.remove('hide')
  menu.classList.add('hide')
}

function authorized(){

  function logOut(){
    login = null;
    localStorage.clear();
    buttonAuth.style.display='';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  }

  console.log("Авторизован");
  userName.textContent = login;

  buttonAuth.style.display='none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  
  buttonOut.addEventListener('click', logOut)
}

function notAuthorized(){
  console.log('Не авторизован');
  
  function logIn(event){
    event.preventDefault();


    if (loginInput.value.trim()){
      login = loginInput.value;
      localStorage.setItem('delivery',login);
      toggleModalAuth();
      downloadCart();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      buttonCloseAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();
    }else {
      loginInput.style.borderColor = "#ff0000";
    }
    

    
  }
  buttonAuth.addEventListener('click', toggleModalAuth);
  buttonCloseAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
  modalAuth.addEventListener('click', (event)=>{
    if(event.target.classList.contains('is-open')){
      toggleModalAuth();
    }
  })
}

function checkAuth(){
  if(login){
    authorized();
  }
  else{ 
    notAuthorized();
  }
}

function createCardsRestaurant(restaurant) {
  const { 
     image,
     kitchen, 
     name, 
     price, 
     stars, 
     products, 
     time_of_delivery: timeOfDelivery } = restaurant;

  const cardRestaurant = document.createElement('a');
  cardRestaurant.className = 'card card-restaurant';
  cardRestaurant.products = products;
  cardRestaurant.info = { kitchen, name, price, stars };

     
  const card = `
						<img src="${image}" alt="image" class="card-image"/>
						<div class="card-text">
							<div class="card-heading">
								<h3 class="card-title">${name}</h3>
								<span class="card-tag tag">${timeOfDelivery}</span>
							</div>
							<!-- /.card-heading -->
							<div class="card-info">
								<div class="rating">
									${stars}
                  </div>
                  <div class="price">От ${price} ₽</div>
                  <div class="category">${kitchen}</div>
                </div>
							<!-- /.card-info -->
						</div>
						<!-- /.card-text -->
  `;
  cardRestaurant.insertAdjacentHTML('beforeend', card);
  cardsRestaurants.insertAdjacentElement('beforeend', cardRestaurant);
}

function createCardGood(goods){
  const { 
    description,
    id,
    image,
    name,
    price,
   } = goods
  const card = document.createElement('div');
  card.className = 'card';
  card.id = id;
  card.insertAdjacentHTML('beforeend', `
						<img src="${image}" alt="image" class="card-image"/>
						<div class="card-text">
							<div class="card-heading">
								<h3 class="card-title card-title-reg">${name}</h3>
							</div>
							<div class="card-info">
								<div class="ingredients">${description}
								</div>
							</div>
							<div class="card-buttons">
								<button class="button button-primary button-add-cart">
									<span class="button-card-text">В корзину</span>
									<span class="button-cart-svg"></span>
								</button>
								<strong class="card-price-bold">${price} ₽</strong>
							</div>
						</div>
  `);
  cardsMenu.insertAdjacentElement('beforeend', card);
}

function openGoods (event){
  const target = event.target;
  if (login){
    const restaurant = target.closest('.card-restaurant');
    if(restaurant){
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');  
      cardsMenu.textContent = '';

      const { name, price , kitchen, stars } = restaurant.info;
      restaurantTitle.textContent = name;
      restaurantRating.textContent = stars;
      restaurantPrice.textContent = `От ${price} ₽`;
      restaurantCategory.textContent = kitchen; 

      getData(`../db/${restaurant.products}`).then((data)=>{
        data.forEach(createCardGood);
      });
    }
  } else {
    toggleModalAuth();
  }
  
}

function addToCart(){
  const target = event.target;

  const buttonAddToCart = target.closest('.button-add-cart');

  if (buttonAddToCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price-bold').textContent;
    const id = card.id;
    const food = cart.find(function(item){
      return item.id === id;
    })
      if (food){
        food.count += 1;
      } else {
        cart.push({title, cost, id, count: 1});
        saveCart();
    }

    

  }


}

function renderCart(){
    
    modalBody.textContent = '';
    cart.forEach(function({id,title,cost,count}){
      const itemCart = `
        <div class="food-row">
					  <span class="food-name">${title}</span>
					  <strong class="food-price">${cost} ₽</strong>
					  <div class="food-counter">
						  <button class="counter-button counter-minus" data-id="${id}">-</button>
						  <span class="counter">${count}</span>
						  <button class="counter-button counter-plus" data-id="${id}">+</button>
					  </div>
				</div>
      `;
      
      modalBody.insertAdjacentHTML('beforeend', itemCart)
    });
    const totalPrice = cart.reduce(function(result, item){ 
      return result + (parseFloat(item.cost) * item.count);
    
    }, 0);

    modalPrice.textContent = totalPrice + ' ₽';
}

function changeCount(event){
  const target = event.target;

  if (target.classList.contains('counter-button')) {
    const food = cart.find(function(item){
      return item.id === target.dataset.id;
    });
    if (target.classList.contains('counter-minus')) {
       food.count--;
 
      if (food.count === 0){
          cart.splice(cart.indexOf(food), 1)
      }
    }
    if (target.classList.contains('counter-plus')) food.count++;
    renderCart();
  }
}

function init(){
  getData('../db/partners.json').then((data)=>{
    data.forEach(createCardsRestaurant);
  });
  
  cartButton.addEventListener("click", ()=>{
    renderCart();
    toggleModal();
  });

  clearCart.addEventListener('click',()=>{
    cart.length = 0;
    renderCart();
  });

  modalBody.addEventListener('click', changeCount);

  cardsMenu.addEventListener('click', addToCart);
  
  close.addEventListener("click", toggleModal);
  
  logo.addEventListener('click', ()=> {
    containerPromo.classList.remove('hide')
    restaurants.classList.remove('hide')
    menu.classList.add('hide')
  });
  
  cardsRestaurants.addEventListener('click', openGoods);
  
  checkAuth();

  inputSearch.addEventListener('keypress', (event)=>{
    const value = event.target.value.trim();

      if(!value){
        event.target.style.backgroundColor = 'red';
        event.target.value = '';
        setTimeout(function(){
          event.target.style.backgroundColor = '';
        }, 50)
        return;
      }

    if(event.charCode === 13) {
      getData('./db/partners.json').then(function(data){
        return data.map((partner)=>{
          return partner.products;
        })
      })
      .then((linksProduct)=>{
        cardsMenu.textContent = '';
        linksProduct.forEach((link)=>{
          getData(`./db/${link}`)

            .then((data)=>{ 

              const resultSearch = data.filter(function(item){
                const name = item.name.toLowerCase();
                return name.includes(value.toLowerCase());
              })

              containerPromo.classList.add('hide');
              restaurants.classList.add('hide');
              menu.classList.remove('hide'); 

              restaurantTitle.textContent = 'Результат поиска';
              restaurantRating.textContent = '';
              restaurantPrice.textContent = ``;
              restaurantCategory.textContent = ''; 
              resultSearch.forEach(createCardGood);
            })
        })
      })
    }
  })
  
  // Slider
  new Swiper('.swiper-container', {
  slidePerView: 1,
  autoplay: true,
  loop: true,
  effect: 'coverflow'
  });
}

init();
