'use strict';

const templates = {
  articleLink: Handlebars.compile(document.querySelector('#template-article-link').innerHTML),
  tagLink: Handlebars.compile(document.querySelector('#template-tag-link').innerHTML),
  authorLink: Handlebars.compile(document.querySelector('#template-author-link').innerHTML),
  tagCloudLink: Handlebars.compile(document.querySelector('#template-tag-cloud-link').innerHTML),
  authorRightList: Handlebars.compile(document.querySelector('#template-author-right-list').innerHTML),
};

const opt = {
  articleSelector: '.post',
  titleSelector: '.post-title',
  titleListSelector: '.titles',
  articleTagsSelector: '.post-tags .list',
  articleAuthorSelector: '.post-author',
  tagsListSelector: '.tags.list',
  cloudClassCount: 5,
  cloudClassPrefix: 'tag-size-',
  authorsListSelector: '.authors'
};

const titleClickHandler = function(event) {
  event.preventDefault();
  const clickedElement = this;

  /*remove class 'active' from all article links*/
  const activeLinks = document.querySelectorAll('.titles a.active');

  for(let activeLink of activeLinks) {
    activeLink.classList.remove('active');
  }

  /*add class 'active' to the clicked link*/
  clickedElement.classList.add('active');

  /*remove class 'active' from all articles*/
  const activeArticles = document.querySelectorAll('.posts article.active');

  for (let activeArticle of activeArticles) {
    activeArticle.classList.remove('active');
  }

  /*get 'href' attribute from the clicked link*/
  const articleSelector = clickedElement.getAttribute('href');

  /*find the correct article using the selector (value of 'href' attribute)*/
  const targetArticle = document.querySelector(articleSelector);

  /*add class 'active' to the correct article*/
  targetArticle.classList.add('active');
};


function generateTitleLinks(customSelector = '') {

  /*remove contents of titleList*/
  const titleList = document.querySelector(opt.titleListSelector);
  titleList.innerHTML = '';

  /*for each article*/
  const articles = document.querySelectorAll(opt.articleSelector + customSelector);
  let html = '';
  for(let article of articles) {

    /*get the article id*/
    const articleId = article.getAttribute('id');
        
    /*find the title element*/
    const articleTitle = article.querySelector(opt.titleSelector).innerHTML;        

    /*create HTML of the link with handlebars*/
    const linkHTMLData = {id: articleId, title: articleTitle};
    const linkHTML = templates.articleLink(linkHTMLData);

    html = html + linkHTML;
    
  }
  /*insert link into titleList*/
  titleList.innerHTML = html;

  const links = document.querySelectorAll('.titles a');
  
  for(let link of links) {
    link.addEventListener('click', titleClickHandler);
  }
} 

generateTitleLinks();

function calculateTagsParams(tags) {
  const params = { min: 999999, max: 0};

  for (let tag in tags) {
    console.log(tag + ' is used ' + tags[tag] + ' times');
    if (tags[tag] > params.max) {
      params.max = tags[tag];
    }
    if (tags[tag] < params.min) {
      params.min = tags[tag];
    }
  }
  return params;
}

function calculateTagClass(count, params) {
  const normalizedCount = count - params.min;
  const normalizedMax = params.max - params.min;
  const percentage = normalizedCount / normalizedMax;
  const classNumber = Math.floor(percentage * (opt.cloudClassCount - 1) + 1);

  return opt.cloudClassPrefix + classNumber;
}

function generateTags() {
  /*create a new variable allTags with an empty object*/
  let allTags = {};

  /* find all articles */
  const articles = document.querySelectorAll(opt.articleSelector);

  /* START LOOP: for every article: */
  for(let article of articles) {

    /* find tags wrapper */
    const titleList = article.querySelector(opt.articleTagsSelector);
    titleList.innerHTML = '';

    /* make html variable with empty string */
    let html = '';

    /* get tags from data-tags attribute */
    const articleTags = article.getAttribute('data-tags');

    /* split tags into array */
    const articleTagsArray = articleTags.split(' ');

    /* START LOOP: for each tag */
    for (let tag of articleTagsArray) {

      /*create HTML of the link with handlebars*/
      const linkHTMLData = {id: tag, title: tag};
      const linkHTML = templates.tagLink(linkHTMLData);

      /* add generated code to html variable */
      html = html + linkHTML;

      /*check if this link is NOT already in allTags*/
      if(!allTags[tag]) {

        /*add generated code to allTags array*/
        allTags[tag] = 1;
      } else {
        allTags[tag]++;
      }
    /* END LOOP: for each tag */
    }
  
    /* insert HTML of all the links into the tags wrapper */
    titleList.innerHTML = html; 

  /* END LOOP: for every article: */
  }

  /*find list of tags in right column*/
  const tagList = document.querySelector('.tags');

  const tagsParams = calculateTagsParams(allTags);
  console.log('tagsParams:', tagsParams);

  /*create new constant for handlebars*/
  const allTagsData = {tags: []};

  /*START LOOP: for each tag in allTags: */
  for(let tag in allTags) {

    /*generate code of a link with handlebars*/
    allTagsData.tags.push({
      tag: tag,
      count: allTags[tag],
      className: calculateTagClass(allTags[tag], tagsParams)
    });
  /*END LOOP: for each tag in allTags: */
  }

  /*add HTML from allTagsData to tagList */
  tagList.innerHTML = templates.tagCloudLink(allTagsData);
  console.log(allTagsData);
}
  
generateTags();

function tagClickHandler(event) {
  /* prevent default action for this event */
  event.preventDefault();

  /* make new constant named "clickedElement" and give it the value of "this" */
  const clickedElement = this;

  /* make a new constant "href" and read the attribute "href" of the clicked element */
  const href = clickedElement.getAttribute('href');

  /* make a new constant "tag" and extract tag from the "href" constant */
  const tag = href.replace('#tag-', '');

  removeClassActive('a.active[href^="#tag-"]');
  
  
  /* find all tag links with "href" attribute equal to the "href" constant */
  const sameTags = document.querySelectorAll('a[href="'+ href + '"]');

  /* START LOOP: for each found tag link */
  for (let sameTag of sameTags) {

    /* add class active */
    sameTag.classList.add('active');
    /* END LOOP: for each found tag link */
  }
  
  /* execute function "generateTitleLinks" with article selector as argument */
  generateTitleLinks('[data-tags~="' + tag + '"]');

  removeClassActive('a.active[href^="#author-"]');
}
  
function addClickListenersToTags() {
  /* find all links to tags */
  const tagLinks = document.querySelectorAll('a[href^="#tag-"]');

  /* START LOOP: for each link */
  for (let tagLink of tagLinks) {

    /* add tagClickHandler as event listener for that link */
    tagLink.addEventListener('click', tagClickHandler); 
    /* END LOOP: for each link */
  }
}
  
addClickListenersToTags();

function generateAuthors() {
  /*generate a new variable allAuthors with an empty object*/
  let allAuthors = {};

  /*find all articles*/
  const articles = document.querySelectorAll(opt.articleSelector);

  /* START LOOP: for every article: */
  for (let article of articles) {
      
    /* find authors wrapper */
    const authorsWrapper = article.querySelector(opt.articleAuthorSelector);
  
    /* make html variable with empty string */
    let html = '';

    /* get author from data-author attribute */
    const articleAuthor = article.getAttribute('data-author');

    /*create HTML of the link with handlebars*/
    const linkHTMLData = {id: articleAuthor, title: articleAuthor};
    const linkHTML = templates.authorLink(linkHTMLData);

    /* add generated code to html variable */
    html = html + linkHTML;

    /* insert HTML of all the links into the authors wrapper */
    authorsWrapper.innerHTML = html;

    /* count articles for each author*/
    if (allAuthors[articleAuthor]) {
      allAuthors[articleAuthor]++;
    } else {
      allAuthors[articleAuthor] = 1;
    }
    console.log(allAuthors);

  }

  /*find list of Authors in right column*/
  const authorList = document.querySelector(opt.authorsListSelector);

  /*create new constant for handlebars*/
  const allAuthorsData = {authors: []};

  /*generate code of a link and add it to allAuthorsHTML*/
  for (let author in allAuthors) {

    /*generate code of a link with handlebars*/
    allAuthorsData.authors.push({
      author: author,
      count: allAuthors[author]
    });
   
  }

  /*add html from allAuthorsData to authorList*/
  authorList.innerHTML = templates.authorRightList(allAuthorsData);
}

generateAuthors();

function authorClickHandler(event) {
  /* prevent default action for this event */
  event.preventDefault();

  /* make new constant named "clickedElement" and give it the value of "this" */
  const clickedElement = this;

  /* make a new constant "href" and read the attribute "href" of the clicked element */
  const href = clickedElement.getAttribute('href');

  /* make a new constant "author" and extract author from the "href" constant */
  const author = href.replace('#author-', '');


  removeClassActive('a.active[href^="#author-"]');

  /* find all author links with "href" attribute equal to the "href" constant */
  const sameAuthors = document.querySelectorAll('a[href="' + href + '"]');

  /* START LOOP: for each found author link*/ 
  for (let sameAuthor of sameAuthors) {

    /* add class active */
    sameAuthor.classList.add('active');

  }
  /* execute function "generateTitleLinks" with article selector as argument */
  generateTitleLinks('[data-author="' + author + '"]');

  removeClassActive('a.active[href^="#tag-"]');
  
}

function addClickListenersToAuthors() {
  /* find all links to authors */
  const authorLinks = document.querySelectorAll('a[href^="#author-"]');

  /*start loop: for each link*/
  for (let authorLink of authorLinks) {

    /* add authorClickHandler as event listener for that link */
    authorLink.addEventListener('click', authorClickHandler);
  }
}

addClickListenersToAuthors();

function removeClassActive(links) {

  /* find all author links with class active */
  const activeLinks = document.querySelectorAll(links);
      
  /* START LOOP: for each active author link */
  for (let activeLink of activeLinks) {
    
    /* remove class active */
    activeLink.classList.remove('active');
    /* END LOOP: for each active author link */
  }
}
