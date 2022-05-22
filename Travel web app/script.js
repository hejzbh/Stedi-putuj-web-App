'use strict';

const mapDiv = document.querySelector('.mapa');
const formDiv = document.querySelector('.forma__div');
const formBtn = document.querySelector('.formSubmit');


const countryNameInp = document.querySelector('.country__name');
const dateInp = document.querySelector('.date');
const moneyInp = document.querySelector('.money');

const dataContainer = document.querySelector('.left');
const stateDiv = document.querySelectorAll('.state');

const detailsDiv = document.querySelector('.details__div');

const info = document.querySelector('.info');
const nameOfCountry = document.querySelector('.nameOfCountry');
const dateText = document.querySelector('.date__place');
const kolikoOstalo = document.querySelector('.jos');
const moneyText = document.querySelector('.moneyPlace');
const moneySaveCalc = document.querySelector('.moneyInt');

const AccBalanceText = document.querySelector('.balance');
const submitBalanceBTN = document.querySelector('.submitBtn');
const inputBalance = document.querySelector('.balance__input');
const balanceInfoDiv = document.querySelector('.about__balance');

const yourMoneyPlace = document.querySelector('.yourCurrPlace');
const countryCurrPlace = document.querySelector('.countryCurrPlace');
const errorDIV = document.querySelector('.error__message');

const burgerFaIcons = document.querySelectorAll('.fa__burger');

const deleteBTN = document.querySelector('.countryDelete');


const closeInfo = document.querySelector('.closeInfo');
const burger = document.querySelector('.burger');
closeInfo.addEventListener('click', function(){
    info.classList.remove('infoAct');
});

class Application {
    userLocale = navigator.language;
    #map;
    #mapEvent;
    countryExist = [];



    constructor(balance){
        this.balance = balance;
        
        this._getLocalStorage();
        this._loadMap();

        

        formBtn.addEventListener('click', this.submitCountry.bind(this));
        dataContainer.addEventListener('click', this._moveOnPop.bind(this));
        dataContainer.addEventListener('mouseover', this.showDetails.bind(this));
        dataContainer.addEventListener('mouseout', this.hideDetails.bind(this));
        dataContainer.addEventListener('click', this.showInfo.bind(this));
       // dataContainer.addEventListener('click', this.deleteState.bind(this));

        submitBalanceBTN.addEventListener('click', this._workWithBalance.bind(this, false));
        burger.addEventListener('click', this._workWithBalance.bind(this, true));

        deleteBTN.addEventListener('click', this.deleteCountry.bind(this));

        
        
    };


  
    get getBalance(){
        return this.balance;
    };

    set setBalance(value){
        this.balance += value;
    }

    // - - - - - - - - - - - - - - -
    // ------- METHOD #1
    // - - - - - - - - - - - - - - -

    _getPosition(){
        return new Promise(function(resolve, reject){
            navigator.geolocation.getCurrentPosition(resolve, function(){
                reject('Molimo vas prihvatite lokaciju.');
            });
        });
    }

    // - - - - - - - - - - - - - - -
    // ------- METHOD #2
    // - - - - - - - - - - - - - - -

    async _loadMap(){
        try {
         // Uzimanje lokacije
         const coordsPromise =  await this._getPosition();
         const {latitude: lat, longitude:lng} = coordsPromise.coords;
 
 
        // API
        this.#map = L.map('map').setView([lat, lng], 13);
 
 
         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
             attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
         }).addTo(this.#map);
         
     
 
 
      // Show form on map click
       this.#map.on('click', this.showForm.bind(this));
 
       this.countryExist.forEach(country=>{
         this._showMarker(country);
     });
 
        } 
        catch(err){
         mapDiv.innerHTML=`${err}`;
        }
 
    
 
     };





    // - - - - - - - - - - - - - - -
    // ------- METHOD #3
    // - - - - - - - - - - - - - - -

    showForm(e){
  

        this.#mapEvent = e;
        formDiv.classList.toggle('hiddenForm');
    }




    // - - - - - - - - - - - - - - -
    // ------- METHOD #3
    // - - - - - - - - - - - - - - -

    async submitCountry(e){
        e.preventDefault();
  
         try {
          //Helper function
          const validInputs = (...inputs) => inputs.every(inp => inp.value);
  
          if(!validInputs(countryNameInp, moneyInp, dateInp)) throw new Error(`Niste unijeli sve podatke`);
  

        //Check if there is already a state with the same ID
       const checkSameCountry = this.countryExist.some(country=>country.id===+countryNameInp.value);
       if(checkSameCountry) throw new Error(`Već postoji država sa istim ID`);
          
            
          // Coords
          let {lat, lng} = this.#mapEvent.latlng;
  
          // Geo api
          const geoAPI = await fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`);
          if(!geoAPI.ok) throw new Error(`Sačekajte par sekundi pa ponovo kliknite na lokaciju`);
      
          const geoData = await geoAPI.json();
      
  
          // Rest countries api
          const countryAPI = await fetch(`https://restcountries.com/v2/name/${geoData.country}`);
          if(!countryAPI.ok) throw new Error(`Država se ne može učitati, zumirajte bliže i ponovo kliknite!`);
          const [countryData] = await countryAPI.json();
  
          this._renderCountry({
              ...countryData,
              id: +countryNameInp.value
          });
          this._showMarker(countryData);
          this.countryExist.push({
              ...countryData,
              money:  +moneyInp.value, //kako bi mogli izracunati details o tom countryu
              id: +countryNameInp.value, // details...
              date: new Date(dateInp.value).toISOString(), //details...
          });

  
  
          this._setLocalCountry(this.countryExist); //LOCAL STORAGE 
  
  
         } catch(err){
             this.errorCatch(err);
         }
      }


    // - - - - - - - - - - - - - - -
    // ------- METHOD #4
    // - - - - - - - - - - - - - - -
    
      _renderCountry(data){
    // Metoda koja za odabrani country inserta DIV u html sa njegovim podacima.
    let html = `
    <div class="state" id="${data.id}">
    <img src="${data.flag}" alt="">
    <div class="ribbon">
    <span class="naljepnica">"${data.capital}"</span>
   </div>
    <div class="description">
        <div class="top">
        </div>
        <div class="bottom">
           <p>🙋‍♂️ ${(data.population/1000000).toFixed(1)}M people</p>
           <h3>${data.name}</h3>
           <span>🗣 ${data.languages[0].name} language</span>
        </div>
      </div>
      <div class="details__div">
      <button class="detailBtn">View details</button>
  </div>
</div>`;


   dataContainer.insertAdjacentHTML('afterbegin', html);
}


    // - - - - - - - - - - - - - - -    
    // ------- METHOD #5
    // - - - - - - - - - - - - - - -

loadAllInformation(e){
    // This is details div about selected country
    // A method that displays information about that trip for selected country

    // Get target div
    const countryDiv = e.target.closest('.state');
    // Get id from that div
    const id = +countryDiv.getAttribute('id');
    // Find country informations with same ID
    const countryData = this.countryExist.find(country => country.id === id);

    // Get currency of that country
    const [currency] = countryData.currencies;

    // Load information
    nameOfCountry.textContent = countryData.name;

    // Set date 
    dateText.textContent = this.formatDates.call(this, new Date(countryData.date));


    // Set money for travel
    moneyText.textContent = this.formatNum(countryData.money, 'EUR');

    // Koliko je ostalo dana do tog putovanja ?
    kolikoOstalo.textContent = this._calcDateDifference(new Date(), new Date(countryData.date));

    // Koliko trebamo svaki dan sačuvati novca da bi do tog datuma sakupili odabrani iznos ?
    moneySaveCalc.textContent = this.calcSaveMoney.call(this, countryData.money,new Date(countryData.date), 'EUR');



  //  this._calcCurrencyDifference.call(this, this.balance, currency.code);

   // Prikazi koliko user ima novca

   yourMoneyPlace.textContent = this.formatNum.call(this,this.balance, 'EUR');

   // Pretvori eure u currency od izabrane države
   this._calcCurrencyDifference.call(this, this.balance, currency.code);


   info.classList.add('infoAct');  // Nakon svih azuriranja, prikazi taj div.
    
};



    // - - - - - - - - - - - - - - -    
    // ------- METHOD #6
    // - - - - - - - - - - - - - - -

    _workWithBalance(show = false, e){
       e.stopImmediatePropagation();
       e.stopPropagation();


       for(const fa of burgerFaIcons) e.target.classList.contains('icon')  ? fa.classList.toggle('hidden') : '';

        // Ako je show true, to znaci da smo trigerali burger koji ima zadatak da prikaze div o balancu, ukoliko je false to znaci da je trigeran button za promjenu balanca unutar tog diva.

         if(show){
            balanceInfoDiv.classList.toggle('balanceAct');
         } 
           else {
         const balanceInp = +inputBalance.value;
         if(!balanceInp) return;
                
                
         this.setBalance = balanceInp;
                
         this._setLocalBalance(); // LOCAL STORAGE

         AccBalanceText.textContent = this.formatNum.call(this,this.getBalance, 'EUR');

         inputBalance.value = '';
           }
         
    }



    // - - - - - - - - - - - - - - -    
    // ------- METHOD #7
    // - - - - - - - - - - - - - - -

    showInfo(e){
        // Metoda koja buttonu seta eventListener za pokretanje diva o svim informacijama o putovanju (za country od kojeg smo uzeli button, tj. trigerali.)
        const btn = e.target.closest('.detailBtn');
        if(!btn) return;
    
        btn.addEventListener('click', this.loadAllInformation.bind(this));
    }


    // - - - - - - - - - - - - - - -    
    // ------- METHOD #8
    // - - - - - - - - - - - - - - -

    _moveOnPop(e){
        const target = e.target.closest('.state'); // Uzmi div na kojeg smo kliknuli
        if(!target) return;

        const id = +target.getAttribute('id'); // Uzmi ID od tog diva

       const country = this.countryExist.find(country => country.id === id);    // Nađi u postojećim odabranim državama DRŽAVU koja ima taj ID. Što je logično...

        // Stavi mapi view na te kordinate
      this.#map.setView(country.latlng, 8, {
        animate:true,
        pan:{
            duration:1,
        }
    });
    }






    errorCatch(msg='Error'){
        errorDIV.style.transform = `translateX(0%)`;
        const messagePlace = errorDIV.querySelector('.error_msg');
        messagePlace.textContent = msg;
        setTimeout(() => {
            errorDIV.style.transform = `translateX(150%)`;
        }, 3000);
        
     
    }




  

    // - - - - - - - - - - - - - - -    
    // ------- METHOD #9
    // - - - - - - - - - - - - - - -

    async _calcCurrencyDifference(value, currency){
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!res.ok) throw new Error(`Cant find that currency`);
        const dataAPI = await res.json();

        let currencyCode = dataAPI.rates[currency];
        // Pošto ovaj objekt od APIa nema property names za valute, moramo izvuci property name od kompletnog objekta kako bi znali koji cemo currency postaviti u metodi ispod (Metoda za formatiranje brojeva zajedno sa currency od te drzave);

        const currencyName = Object.getOwnPropertyNames(dataAPI.rates).find(name => name === currency);

    
          countryCurrPlace.textContent = this.formatNum.call(this,((value*currencyCode)/0.90537).toFixed(2), currencyName); 
    
      } catch(err){
        this.errorCatch(err);
      }
       
    }

    // - - - - - - - - - - - - - - -    
    // ------- METHOD #10
    // - - - - - - - - - - - - - - -

    _showMarker(data){

        L.marker([...data.latlng]).addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth:100,
            autoClose:false,
            closeOnClick:false,
        })) 
        .setPopupContent(`${data.name}`)
        .openPopup();
    
    
    
     }


    // - - - - - - - - - - - - - - -    
    // ------- METHOD #11
    // - - - - - - - - - - - - - - -

   _calcDateDifference(date1,date2){
    return Math.trunc(Math.abs(date1-date2)/(1000*60*60*24));
    //Metoda koja racuna razliku u danima izmedju danasnjeg datuma i datuma kojeg smo odabrali za putovanje.
    
   }

    // - - - - - - - - - - - - - - -    
    // ------- METHOD #12
    // - - - - - - - - - - - - - - -

   calcSaveMoney(moneyForTravel, date, currency){
       // Metoda koja racuna koliko moramo sacuvati para svakog dana da bi do tog datuma putovanja imali ukupan iznos;
    
     const x = Math.ceil((moneyForTravel - this.balance) / this._calcDateDifference(new Date(), date));

     // Ako je ta cifra veca od 0 vrati ovo
      if(x>0){
        document.querySelector('.perDay').style.display='unset';
        return  this.formatNum(x, currency); }

        //Ako nije obrisi div "perDay/ i returnaj VEC IMATE TOLIKO NOVCA"
        else {
                document.querySelector('.perDay').style.display='none';
                return 'Već imate toliko novca';
            }
       
   }


     // - - - - - - - - - - - - - - -    
    // ------- METHOD #13
    // - - - - - - - - - - - - - - -
   deleteCountry(e){
    const target = e.target.parentNode.parentNode.firstElementChild.firstElementChild.children;

 const nameOfCountry = [...target][0].innerHTML;

 const countryDIV = this.countryExist.find(country => country.name===nameOfCountry);
 console.log(countryDIV);

 const indexOf = this.countryExist.findIndex(country => country.name===nameOfCountry);
 
 document.querySelectorAll('.state').forEach(el=>{
    if(+el.getAttribute('id')===countryDIV.id){
        el.style.display='none';
    }

    location.reload();
});

 this.countryExist.splice(indexOf, 1);

 info.classList.remove('infoAct');

 this._setLocalCountry();
 
    
}

 

  
    // <><><><><><><><><><><><><><><><
    // O S T A L E  M E T O D E 
    // <><><><><><><><><><><><><><><><

    // Metoda koja formatira date
    formatDates(date){
       return new Intl.DateTimeFormat(this.userLocale, {
           month:'long',
           year:'numeric',
           day:'2-digit'
       }).format(date);
    }

    // Metoda koja formatira broj
    formatNum(number, currency){
        return new Intl.NumberFormat(this.userLocale, {
            style:'currency',
            currency:currency
    
        }).format(number);
    }

    // showDetails i hideDetails metode su namjenjene za prikazivanje zelenog diva preko state divova, on u sebi nosi VIEW DETAILS btn, da lakse razumijete!

    // Metoda koja se pokrece na mouseover
    showDetails(el){
        const target = el.target.closest('.state');
        if(!target) return;

        const div = target.querySelector('.details__div');
        
        div.classList.add('detailsActive');

       
    }

    // Metoda koja se pokrece na mouseout/leave
    hideDetails(el){
        const target = el.target.closest('.state');
        if(!target) return;

        const div = target.querySelector('.details__div');
        
        div.classList.remove('detailsActive');
    }



    
   




   



    // Bitne metode koje nisu dopuštene korisniku, osim reseta

    _setLocalCountry(){
        localStorage.setItem('country',  JSON.stringify(this.countryExist));
    }

    _setLocalBalance(){
        localStorage.setItem('balance',  JSON.stringify(this.balance));
    }


    _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('country'));
        const balance = JSON.parse(localStorage.getItem('balance'));

        if(!data) return;

        this.balance = balance || 0;

        this.countryExist = data;

        AccBalanceText.textContent = this.formatNum(this.balance, 'EUR');

        this.countryExist.forEach(country=>{
            this._renderCountry(country);
        });

    }


    reset(){
        localStorage.removeItem('country');
        location.reload();


    }



    
};



const app = new Application(0);




document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){
        formDiv.classList.add('hiddenForm');
        balanceInfoDiv.classList.remove('balanceAct');
}});

/*
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Host': 'currency-converter5.p.rapidapi.com',
		'X-RapidAPI-Key': '5ddd22b24fmshffe63561ff22dcap148652jsn2825b2730aa4'
	}
};


*/

