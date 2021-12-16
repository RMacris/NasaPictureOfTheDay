const key = 'D7MGq20gEPU2EfSCjhXfcurHkw7ItslfPo3asfrl'
const api = 'https://api.nasa.gov/planetary/apod?api_key=D7MGq20gEPU2EfSCjhXfcurHkw7ItslfPo3asfrl&date='

let time = null;  //time in ms (5 seconds)

const dateInput = $("#Date")
const imgElement = $("#SkyImg")
const cardList = $("#CardList")


window.onload = function(){
    let now = moment().subtract(1,'days').format("YYYY-MM-DD")
    let data =  RequestImage(now,Success,RequestError)
    Promise.resolve(data).then(response => {
        UpdateImage(response.url)
        PopulateInfo(response.title,response.explanation,response.copyright)
        console.log(response)
    })
    PopulateAdjacentYears(now)

    
}
dateInput.on('change', WaitInputFinishToRequest) 

function IsValidDate(date=''){
    date = moment(date).format("YYYY-MM-DD")
    let maxDate = moment().subtract(1,'days').format("YYYY-MM-DD")
    let minDate = moment('1995-06-16').format("YYYY-MM-DD")
    if(!moment(date).isBefore(minDate) && !moment(date).isAfter(maxDate) && !moment(date).isLeapYear()){
        return true
    }
    return false
}

function PopulateAdjacentYears(date='', amount=10) {
    
    let listOfRequests = []
    for(let i = -amount; i < amount; i++ ){
        if(i > 0){
            let nextYearDate =  moment(date).add(Math.abs(i), 'year').format("YYYY-MM-DD")
            if(IsValidDate(nextYearDate)){
                // add to the list
                let data =  RequestImage(nextYearDate,Success,RequestError)
                listOfRequests.push(data)

            }
        }
        if(i < 0){
            let previousYearDate =  moment(date).subtract(Math.abs(i), 'year').format("YYYY-MM-DD")
            if(IsValidDate(previousYearDate)){
                let data =  RequestImage(previousYearDate,Success,RequestError)
                // add to the list
                listOfRequests.push(data)
            }
        }
        if(i == 0){
            let momentDate =  moment(date).format("YYYY-MM-DD")
            if(IsValidDate(momentDate)){
                let data =  RequestImage(momentDate,Success,RequestError)
                // add to the list
                // selected date
                listOfRequests.push(data)
            }
        }
    }
    
    //resolve all requests populating the html with the cards 
    Promise.all(listOfRequests).then(responses => {
        //iterate over resolved promises
        responses.map((response,index) => {
            // create a card with id card_ + index
            console.log(response,index)
            let card = CardFactory(response.url, response.title,response.copyright,response.explanation,index)
            // put the card in the card list using innerHTML
            cardList.append(card) 
        })
    })
}



function WaitInputFinishToRequest(e) {
    clearTimeout(time)
    time = setTimeout(() => {
        console.log(e.target.value)
        console.log(typeof e.target.value)

        let data = RequestImage(e.target.value,Success,RequestError)
        console.log(data)
        Promise.resolve(data).then(response => {
            UpdateImage(response.url)
            PopulateInfo(response.title,response.explanation,response.copyright)
            console.log(response)
        })
        PopulateAdjacentYears(e.target.value)
    }, 1000);
}


function Success(response, textStatus, xhr) {
    console.log(response, textStatus, xhr)
    UpdateImage(response.url)
    PopulateInfo(response.title,(response.explanation),response.copyright)
}
function RequestError(data) {
    throw new Error(data.responseJSON.msg)
}
function RequestImage(date = '', sucessCallback, failCallback) { 
    return $.ajax({
        type:'get',
        url: api + date,
        contex: document.body,
        async : true,
        // success: sucessCallback,
        error: failCallback
    })
}
function UpdateImage(url) {
    console.log('updating image')
    imgElement.attr('src',url)
}
function PopulateInfo(title='',description='',copyright=''){
    $('#ImgTitle').text(title)
    $('#ImgDescription').text(description)
    $('#ImgCopyright').text("\251 Copyright - " + copyright)
}

function CardFactory(url='',title='',copyrcopyrightigth='',description='',identifier=0){
    const card = {
        imgUrl: '',
        title: '',
        copyright: '',
        description: '',
        identifier: 0,
        setImgUrl: function(url='') {
            this.imgUrl = url
        },
        setTitle: function(title='') { 
            this.title = title

        },
        setCopyright: function(copyright='') { 
            this.copyright = copyright
            
        },
        setdescription: function(description='') { 
            this.description = description

        },
        setIdentifier: function(identifier=0) { 
            this.identifier = identifier

        },
        
        _Create:  function (url='',title='',copyrcopyrightigth='',description='',identifier=0){
            // the utility of having a setup like this is that, all the inputs can be validated on their own setters
            // although in that case, we don't actually need to validate
            this.setImgUrl(url)
            this.setTitle(title)
            this.setCopyright(copyrcopyrightigth)
            this.setdescription(description)
            this.setIdentifier(identifier)

            let card = $('<div>').addClass("card")
            let imgContainer = $('<div>').addClass("card__img-container").attr('id','card_'+identifier.toString())
            let img = $('<img>').addClass("img-container__img").attr('src',this.imgUrl.toString())
            let h3 = $('<h3>').addClass("card__img-title").text(this.title.toString() )
            let p = $('<p>').addClass("card__description").text(this.description.toString())


            imgContainer.append(img)
            card.append(imgContainer)
            card.append(h3)
            card.append(p)
            return card
        }
    }
    return card._Create(url,title,copyrcopyrightigth,description,identifier)
}