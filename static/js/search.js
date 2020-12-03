function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(doSearch);

const searchOptions = {
  keys: [{
      name: "title",
      weight: 1.0
    },
    {
      name: "contents",
      weight: 0.5
    },
    {
      name: "tags",
      weight: 0.8
    }
    // {
    //   name: "categories",
    //   weight: 0.3
    // }
  ]
};

function doSearch() {
  const param = name => decodeURIComponent((location.search.split(name + '=')[1] || '').split('&')[0]).replace(/\+/g, ' ');
  var searchQuery = param("s");
  if (searchQuery) {
    document.getElementById("search-input").value = searchQuery;
    executeSearch(searchQuery.trim().split(" ").map(t => t.trim()));
  } else {
    var para = document.createElement("p");
    para.innerText = "Please enter a word or phrase above";
    document.getElementById("search-results").appendChild(para);
  }
}

function KMPMatch(text, pattern) {
  if (!text || !pattern)
    return { match: 0, firstPos: -1 };
  if (Array.isArray(text)) {
    let match = 0;
    text.forEach(function(t) {
      let res = KMPMatch(t, pattern);
      match += res.match;
    });
    return { match, firstPos: [] };
  }
  if (Array.isArray(pattern)) {
    let match = 0;
    let firstPos = [];
    pattern.forEach(function(p) {
      let res = KMPMatch(text, p);
      match += res.match;
      if (firstPos.length == 0)
        firstPos = res.firstPos;
    });
    return { match, firstPos };
  }
  text = text.toLowerCase(), pattern = pattern.toLowerCase();
  let match = 0;
  let firstPos = [];
  let fail = new Uint32Array(pattern.length);
  for (let i = 1, j = 0; i < pattern.length; i++) {
    while (j != 0 && pattern[i] != pattern[j]) j = fail[j-1];
    if (pattern[i] == pattern[j]) ++j;
    fail[i] = j;
  }
  for (let i = 0, j = 0; i < text.length; i++) {
    while (j != 0 && text[i] != pattern[j]) j = fail[j-1];
    if (text[i] == pattern[j]) ++j;
    if (j == pattern.length) {
      ++match;
      if (firstPos.length == 0) firstPos = [i, i + pattern.length];
      j = fail[j-1];
    }
  }
  return { match, firstPos };
}

function executeSearch(searchQueries) {
  getJSON("/index.json", function (data) {
    // console.log(data);
    data.forEach(function(page) {
        const linenos = /1 2(?: \w+)*/g; // not sure if it works well
        page.contents = page.contents.replace(linenos, " ");
    });
    let result = data.map(function(page) {
      let score = 0;
      let matches = [];
      for (let { name, weight } of searchOptions.keys) {
        let { match, firstPos } = KMPMatch(page[name], searchQueries);
        if (match != 0) {
          score += weight * match;
          matches.push({ key: name, indices: firstPos });
        }
      }
      return { item: page, matches, score };
    })
      .filter(p => p.score > 0)
      .sort((a, b) => (b.score - a.score));
    if (result.length > 0) {
      populateResults(result, searchQueries);
    } else {
      var para = document.createElement("P");
      para.innerText = "No matches found";
      document.getElementById("search-results").appendChild(para);
    }
  });
}

function populateResults(result, searchQueries) {
  const maxResults = 25;
  const summaryLength = 120;
  result.slice(0, maxResults).forEach(function (value, key) {
    var content = value.item.contents;
    var snippet = "";
    var tags = [];
    value.matches.forEach(function (mvalue, matchKey) {
      if (mvalue.key == "contents") {
        let start = Math.max(mvalue.indices[0] - summaryLength, 0);
        let end = Math.min(mvalue.indices[1] + summaryLength, content.length);
        if (start != 0) snippet += "... ";
        snippet += content.substring(start, end);
        if (end != content.length) snippet += " ...";
      }
    });
    if (snippet.length == 0)
      snippet += content.substring(0, summaryLength * 2) + " ...";

    // pull template from hugo templarte definition
    var templateDefinition = document.getElementById("search-result-template").innerHTML;
    // replace values
    var output = render(templateDefinition, {
      key: key,
      title: value.item.title,
      link: value.item.permalink,
      tags: value.item.tags,
      categories: value.item.categories,
      snippet: snippet
    });
    if (key != 0) {
      document.getElementById("search-results").appendChild(htmlToElement("<hr>"));
    }
    document.getElementById("search-results").appendChild(htmlToElement(output));

    searchQueries.forEach(s => {
        new Mark(document.getElementById(`summary-${key}`)).mark(s);
    });
  });
}

function getJSON(url, fn) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      fn(data);
    } else {
      console.log("Target reached on " + url + " with error " + request.status);
    }
  };
  request.onerror = function () {
    console.log("Connection error " + request.status);
  };
  request.send();
}

function render(templateString, data) {
  var conditionalMatches, conditionalPattern, copy;
  conditionalPattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;
  //since loop below depends on re.lastInxdex, we use a copy to capture any manipulations whilst inside the loop
  copy = templateString;
  while ((conditionalMatches = conditionalPattern.exec(templateString)) !== null) {
    if (data[conditionalMatches[1]]) {
      //valid key, remove conditionals, leave content.
      copy = copy.replace(conditionalMatches[0], conditionalMatches[2]);
    } else {
      //not valid, remove entire section
      copy = copy.replace(conditionalMatches[0], '');
    }
  }
  templateString = copy;
  //now any conditionals removed we can do simple substitution
  var key, find, re;
  for (key in data) {
    find = '\\$\\{\\s*' + key + '\\s*\\}';
    re = new RegExp(find, 'g');
    templateString = templateString.replace(re, data[key]);
  }
  return templateString;
}

/**
 * By Mark Amery: https://stackoverflow.com/a/35385518
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
