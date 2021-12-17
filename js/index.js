const key = 'D7MGq20gEPU2EfSCjhXfcurHkw7ItslfPo3asfrl'
const api = 'https://api.nasa.gov/planetary/apod?api_key=D7MGq20gEPU2EfSCjhXfcurHkw7ItslfPo3asfrl&date='

let time = null;  //time in ms (5 seconds)

const dateInput = $("#Date")
const imgElement = $("#SkyImg")
const cardList = $("#CardList")
const moveLeftBtn = $('.image-move-left')
const moverRightBtn = $('.image-move-right')




window.onload = function(){
    let now = moment().subtract(1,'days').format("YYYY-MM-DD")
    let data =  RequestImage(now,Success,RequestError)
    dateInput.val(now)
    Promise.resolve(data).then(response => {
        UpdateContent(response.url, response.media_type)
        PopulateInfo(response.title,response.explanation,response.copyright)
        console.log(response)
    })
    PopulateAdjacentYears(now)
    
    
}
function UpdateContent(url, mediaType){
    console.log(mediaType)
    if(mediaType == 'video'){
        $("#ImageWraper").css("display",'none');
        $("#VideoWraper").css("display",'flex',);
        UpdateVideo(url)

    }
    else if(mediaType == 'image'){
        $("#ImageWraper").css("display",'flex');
        $("#VideoWraper").css("display",'none',);
        UpdateImage(url)
        UpdateVideo('')
    }

}
function UpdateVideo(url){ 
    
    $("#Video").attr('src', url )

   
}
moveLeftBtn.on('click', leftImage)
moverRightBtn.on('click', rightImage)

function leftImage(){
    
    let newDate = moment(dateInput.val()).subtract(1,'days').format("YYYY-MM-DD")
    console.log(newDate , 'being called')
    if(IsValidDate(newDate)){
        dateInput.val(newDate).trigger("changeDateTrigger")


    }
}

function rightImage() {
    let newDate = moment(dateInput.val()).add(1,'days').format("YYYY-MM-DD")
    if(IsValidDate(newDate)){
        dateInput.val(newDate).trigger("changeDateTrigger")


    }
}
dateInput.on('change changeDateTrigger', WaitInputFinishToRequest) 

function IsValidDate(date=''){
    date = moment(date).format("YYYY-MM-DD")
    let maxDate = moment().subtract(1,'days').format("YYYY-MM-DD")
    let minDate = moment('1995-06-16').format("YYYY-MM-DD")
    if(!moment(date).isBefore(minDate) && !moment(date).isAfter(maxDate) && !moment(date).isLeapYear()){
        return true
    }
    console.error(`${date} is not a valid date`)
    return false
}



function PopulateAdjacentYears(date='', amount=10) {
    ClearCardList()
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
            console.log(response.media_type  , !response.media_type)
            if(response.media_type != 'video' && response.media_type != 'other'){
                let card = CardFactory(response.url, response.title, response.copyright, response.explanation, index, response.date)
                // put the card in the card list using innerHTML
                cardList.append(card) 

            }
        })
    })
}

// ideally, i would implement a pooling system to properly track the cards 
// and not rendering them twice, instead, just finding then in the template, and , replacing it's data 
function ClearCardList(){
    cardList.html('')
}


function WaitInputFinishToRequest(e) {
    clearTimeout(time)
    time = setTimeout(() => {
        console.log(e.target.value)
        console.log(typeof e.target.value)

        let data = RequestImage(e.target.value,Success,RequestError)
        console.log(data)
        Promise.resolve(data).then(response => {
            UpdateContent(response.url,response.media_type)
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

function CardFactory(url='',title='', copyright='', description='', identifier=0, date='' ){
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
        setDate: function(date='') { 
            //validation example
            date = moment(date).format('YYYY-MM-DD')
            this.date = date

        },
        setIdentifier: function(identifier=0) { 
            this.identifier = identifier

        },
        
        _Create:  function (url='',title='',copyright='',description='', date='',identifier=0){
            // the utility of having a setup like this is that, all the inputs can be validated on their own setters
            // although in that case, we don't actually need to validate
            this.setImgUrl(url)
            this.setTitle(title)
            this.setCopyright(copyright)
            this.setdescription(description)
            this.setIdentifier(identifier)
            this.setDate(date)

            let card = $('<div>').addClass("card")
            let imgContainer = $('<div>').addClass("card__img-container").attr('id','card_'+identifier.toString())
            let img = $('<img>').addClass("img-container__img").attr('src',this.imgUrl.toString())
            let cardTitle = $('<h3>').addClass("card__img-title").text(this.title.toString())
            let cardDescription = $('<p>').addClass("card__description").text(this.description.toString())
            let cardDate = $('<p>').addClass("card__date").text(this.date)
            
            card.on('click',function(e) {
                //only triggers the functionality if the image is the taret of the event of click
                if(e.target == e.currentTarget.querySelector('.img-container__img')){
                    let inputDate = $('#Date');
                    let card = $(e.currentTarget.querySelector(".card__date"))
                    inputDate.val(card.text()).trigger('changeDateTrigger')
                }
            })

            imgContainer.append(img)
            card.append(imgContainer)
            card.append(cardTitle)
            card.append(cardDescription)
            card.append(cardDate)
            return card
        }
    }
    return card._Create(url,title,copyright,description,date,identifier)
}