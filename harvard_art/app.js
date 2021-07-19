//=================================== Module 1 ===================================

const BASE_URL = 'https://api.harvardartmuseums.org'; 
const KEY = 'apikey=895ed4f2-fcae-4dce-ba07-968228374d30';

//fetches our specific data with our key
async function fetchObjects() {
    const url = `${ BASE_URL }/object?${ KEY }`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

fetchObjects().then(x => console.log(x));

// Search Bar: Second Step : fetchAllCenturies / fetchAllClassifications / prefetchCategoryLists
// fetchAllCenturies & fetchAllClassifications are very similar
async function fetchAllCenturies() {
    const url = `${ BASE_URL }/century?${ KEY }&size=100&sort=temporalorder`;
    if (localStorage.getItem('centuries')) {
      return JSON.parse(localStorage.getItem('centuries'));
    }
    try {
      const response = await fetch(url);
      const data = await response.json();
      const records = data.records;
      localStorage.setItem('centuries', JSON.stringify(records))
      return records;
    } catch (error) {
      console.error(error);
    }   
  }

fetchAllCenturies()

async function fetchAllClassifications() {
  
  const url = `${ BASE_URL }/classification?${ KEY }&size=100&sort=name`;

  if (localStorage.getItem('classifications')) {
      return JSON.parse(localStorage.getItem('classifications'));
    } 
    try {
        const response = await fetch(url);
        const data = await response.json();
        const records = data.records;
        localStorage.setItem('classifications', JSON.stringify(records))
        console.log(records)
        return records;
    } catch (error) {
        console.error(error);
    }
}

fetchAllClassifications()

async function prefetchCategoryLists() {
    try {
        const [classifications, centuries] = await Promise.all([
            fetchAllClassifications(),
            fetchAllCenturies()
        ]);
        $('.classification-count').text(`(${ classifications.length})`);
        
        classifications.forEach(classification => {
            let valueText = $(`<option value="${classification.name}"> ${classification.name}</option>`);
        $('#select-classification').append(valueText)
        });
        
        $('century-count').text(`(${ centuries.length})`);
        centuries.forEach(century => {
            $('#select-century').append($(`<option value="${century.name}">${century.name}</option>`))
        })
    } catch (error) {
            console.error(error);
        }
    }

prefetchCategoryLists();

//need vals from #select-classification, #select-century, and #keywords
function buildSearchString() {
    const BASE_URL = 'https://api.harvardartmuseums.org'; 
    const KEY = 'apikey=895ed4f2-fcae-4dce-ba07-968228374d30';
    const selectClassification = $('#select-classification').val();
    const selectCentury = $('select-century').val();
    const keywords = $('#keywords').val();

    const url = `${ BASE_URL }/object?${ KEY }&classification=${ selectClassification }&
    century=${selectCentury}&keyword=${keywords}`;
    const encodeUrl = encodeURI(url);
    return encodeUrl;
}

$('#search').on('submit', async function (event) {
    event.preventDefault();
    onFetchStart();
    try {
      const response = await fetch(buildSearchString());
      const {records, info} = await response.json();
      updatePreview(records);
    } catch (error) {
      console.error(error)
    } finally {
        onFetchEnd();
    }
  });

  function onFetchStart() {
    $('#loading').addClass('active');
  }
  
  function onFetchEnd() {
    $('#loading').removeClass('active');
  }
 
// //=================================== Module 2 ===================================

function renderPreview(record) {
    if (!record) {
        return
    }
    
    const { description, primaryimageurl, title } = record
    const element = $(`
    <div class="object-preview">
        <a href="#">
            <img src="${primaryimageurl ? primaryimageurl : ''}"/>
            <h3>${title ? title : ''}</h3>
            <h3>${description ? description : ''}</h3>
        </a>
    </div>`).data('record', record);
//issue
  return element;
}

function updatePreview(records) {
    const root = $('#preview');
    $('section.results').empty();
    records.forEach((record) => {
      $('section.results').append(renderPreview(record))
    })
  
    if(info.next) {
      root.find('.next').data('url', info.next).attr('disabled', false);
    } else {
        root.find('next').data('url', null).attr('disabled', true);
    }
    if (info.previous) {
      root.find('.previous').data('url', info.previous).attr('disabled', true);
    } else {
      root.find('.previous').data('url', null).attr('disabled', true);
    }

    const resultingElem = root.find('.results');

    resultingElem.empty();

    records.forEach(record => {
      resultingElem.append(renderPreview(record));
    });
}

//Almost identical to .on('submit') for BuildSearchString()
$('#preview .next, #preview .previous').on('click', async function() {
  onFetchStart();
  try {
    const clickedUrl = $(this).data('url')
    const response = await fetch(clickedUrl)
    const {records, info} = await response.json();
    updatePreview(records, info);
    
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
})

//=================================== Module 3 ===================================


$('#preview').on('click', '.object-preview', function (event) {
  event.preventDefault(); // they're anchor tags, so don't follow the link
  // find the '.object-preview' element by using .closest() from the target
  // recover the record from the element using the .data('record') we attached
  // log out the record object to see the shape of the data
  const object = $(this).closest('object-preview').data('record')
  console.log(object)
});


function renderFeature(record) {
  /**
   * We need to read, from record, the following:
   * HEADER: title, dated
   * FACTS: description, culture, style, technique, medium, dimensions, people, department, division, contact, creditline
   * PHOTOS: images, primaryimageurl
   */

  // build and return template
  return $(`<div class="object-feature">

  </div>`);
}


// function factHTML () {
// //extra info
//   `<section class="facts">
//   ${ factHTML("Culture", record.culture, 'culture') }
//   ${ factHTML("Style", record.style) }
// </section>`
// //extra info
// <span class="title">Culture</span>
// <span class="content"><a href="WELL_FORMED_URL">Japanese</a></span>

// }

// function searchURL(searchType, searchString) {
//   return `${ BASE_URL }/object?${ KEY }&${ searchType}=${ searchString }`;
// }

// //not started
// function factHTML(title, content, searchTerm = null) {
//   // if content is empty or undefined, return an empty string ''

//   // otherwise, if there is no searchTerm, return the two spans

//   // otherwise, return the two spans, with the content wrapped in an anchor tag
// }

// //PERSON 

// record.people.map(function(person) {
//   return factHTML('Person', person.displayname, 'person');
// }).join('')


// `<section class="facts">
//   <!-- the other facts -->

//   ${
//     record.people
//     ? record.people.map(function(person) {
//         return factHTML('Person', person.displayname, 'person');
//       }).join('')
//     : ''
//   }

//   <!-- the other facts -->
// </section>`

// // CONTACT not started

// ${ factHTML('Contact', `<a target="_blank" href="mailto:${ contact }">${ contact }</a>`) }

// // IMAGES not started

// function photosHTML(images, primaryimageurl) {
//   // if images is defined AND images.length > 0, map the images to the correct image tags, then join them into a single string.  the images have a property called baseimageurl, use that as the value for src

//   // else if primaryimageurl is defined, return a single image tag with that as value for src

//   // else we have nothing, so return the empty string
// }

// // CLEAN UP SOME THINGS not started

// function renderSomething(inputObj) {
//   const { thing, otherThing } = inputObj;

//   return `${ thing }, ${ otherThing }`;
// }

// // or 

// function renderSomething({ thing, otherThing }) {
//   return `${ thing }, ${ otherThing }`;
// }

// // FINALLY not started

// $('#feature').on('click', 'a', async function (event) {
//   // read href off of $(this) with the .attr() method

//   // prevent default

//   // call onFetchStart
//   // fetch the href
//   // render it into the preview
//   // call onFetchEnd
// });

// // OK, ALMOST FINALLY . . . not started
