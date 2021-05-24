'use strict';

// Creating Parent class for our work out 
class Workout{
    date = new Date();
    id = (Date.now() + "").slice(-10);

    constructor(coords,distance,duration){
        this.coords = coords;
        this.distance = distance;
        this.duration =duration;
    }

    _setDiscription(){
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 
        'May', 'June', 'July', 'August', 'September', 'October', 
        'November', 'December'];

        this.discription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
            months[this.date.getMonth()]} ${this.date.getDate()}`;

    }

}

// Creating a child element of Workout
class Running extends Workout{
    type = 'running';

    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration);
        this.cadence = cadence;
        this.calcPace();
        // Calculate description for running
        this._setDiscription()
    }

    // calculate Pace min/km
    calcPace(){
        this.pace = this.duration / this.duration
        return this.pace;
    }
};

class Cycling extends Workout{
    type = 'cycling';

    constructor(coords,distance,duration,elevationGain){
        super(coords,distance,duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        // Calculate description for cycling
        this._setDiscription()
    }

    // Calculate  speed km/h
    calcSpeed(){
        this.speed = this.distance / (this.duration / 60);
        return this.speed
    };
};

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Geolocate{
    // Private properties.
    #map;
    #mapZoomLevel = 13;
    #mavEve;
    #workOuts = [];

    constructor(){
        // Get Position
         this._getPosition();

        //  switch between Cycling and Running
         this._switchWorkOutType();

        //  Get data from local storage
        this._getLocalStorage();

        //  Add event listener
         form.addEventListener('submit',this._addWorkOut.bind(this));
         containerWorkouts.addEventListener('click', this._moveMapToWorkOut.bind(this));
    }
    
    _getPosition(){
        navigator?.geolocation?.getCurrentPosition(this._geoSucess.bind(this),function(){
            alert('Can not get user location')
        });
    }

    // Get call if the getposition is successfull to get user position.
    _geoSucess(position){
        
        const {latitude,longitude} = position.coords;
        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

         // Set the marker base on the data in localstorage this._addMarkerToMap(work)
         this.#workOuts.forEach(work => this._addMarkerToMap(work));

        this.#map.on('click', this._loadForm.bind(this));
        
    }

    _geoSucessOffline(){
        const coords = [7.475325581644388, 3.869419097900391];

        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        
        this.#map.on('click', this._loadForm.bind(this));
    }

    // Method to load form
    _loadForm(e){
        const {lat,lng} = e.latlng;
        this.#mavEve = [lat,lng];
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    // Method to add form after inputting data.
    _hideform(){
        // Clear the input fields
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = "";
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(()=> form.style.display = 'grid', 1000);
        
    }

    _addWorkOut(e){
        e.preventDefault();

         // Get all input values
         const type = inputType.value;
         const distance =  +inputDistance.value;
         const duration = +inputDuration.value;
         let newWorkOut;
        // Method to check if input is number
            const isNumber = (...nums)=> nums.every(num => Number.isFinite(num));

        // Method to check if input is positive
            let isPositive = (...nums)=> nums.every(num => num > 0);

        // If Running workout, create runinng wookout
             if(type === 'running'){
                 const cadence = +inputCadence.value;
                
                 // Check if the data is value
                if(!isNumber(distance,duration,cadence) || !isPositive(distance,duration,cadence)){
                    return alert("Kindly input a positive number")
                }  
                
                // Create a new instance of Runnung and push to workouts array
                newWorkOut = new Running(this.#mavEve,distance,duration,cadence);

             }
            
         // if Cycling workout, create cycle workout
             if(type ===  'cycling'){
                 const elevation = +inputElevation.value;

                if(!isNumber(distance,duration,elevation))
                    return alert("Kindly input a number")

                if(!isPositive(distance,duration))
                return alert("Kindly input a positive number");

                newWorkOut = new Cycling(this.#mavEve, distance,duration,elevation); 
             }

         // Add object to workout array
            this.#workOuts.push(newWorkOut);
            console.log(newWorkOut);

         // Render workout to the workout List 
          this._addWorkOutToSideBar(newWorkOut);
 
        this._hideform();
        this._addMarkerToMap(newWorkOut);

        // Store Data to local Storage
        this._setLocalStorage();
    }

    _addMarkerToMap(workout){
        L.marker(this.#mavEve)
        .addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className : `${workout.type}-popup`
        }))
        .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.discription}`)
        .openPopup();
    }

    _addWorkOutToSideBar(workout){
        let html = `
        <li class="workout workout--${workout.type}" data-id=${workout.id}>
            <h2 class="workout__title">${workout.discription}</h2>
            <div class="workout__details">
            <span class="workout__icon"> ${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">min</span>
            </div>
        `

        if(workout.type === 'running'){
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(1)}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
            </li>
            `
        }else{
            html +=`
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevationGain}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li>
            `
        }

        form.insertAdjacentHTML('afterend',html);
    }

    // Method to switch workout type (Running or Cycling) 
    _switchWorkOutType(){
         // Switch input fields
         inputType.addEventListener('change',function(e){
            e.preventDefault();
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        })
    }

    _moveMapToWorkOut(e){
        // Get the [parent element]
        const workEl = e.target.closest('.workout');
        let matchWorkOut
        if(workEl){
            matchWorkOut = this.#workOuts.find( workOut => workOut.id === workEl.dataset.id)
            console.log(matchWorkOut);

            this.#map.setView(matchWorkOut.coords, this.#mapZoomLevel,{
                animate:true,
                pan:{
                    duration:1
                }
            })
        }
    }

    _setLocalStorage(){
        localStorage.setItem('workOuts', JSON.stringify(this.#workOuts));
    }

    // Method to delete all workout from Local storage 
    _resetApp(){
        localStorage.removeItem('workOuts');
        location.reload();
    }

    _getLocalStorage(){
        let localData = JSON.parse(localStorage.getItem('workOuts'));
        if(localData){
            this.#workOuts  = localData;
            this.#workOuts.forEach(work => this._addWorkOutToSideBar(work));
        }
    }
}

const geolocate = new Geolocate;