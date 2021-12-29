// Redesigned by t.me/TheFirstSpeedster, which was written by someone else, credits are given on Source Page (which idk if it still exists).
// OG Repository got removed. Code is modified for private use and is conformed to the original maker's MIT License.
// Code origin is 2.0.18-beta.1, which was the last release and has code from earlier versions, don't ask why.
function init() {
    document.siteName = $('title').html();
    var html = `<header>
   <div id="nav">
   </div>
</header>
<div>
<div id="content" style="padding-top: ${UI.header_padding}px;${UI.fixed_footer ?' padding-bottom: clamp(170px, 100%, 300px);': ''}">
</div>
<div class="modal fade" id="SearchModel" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="SearchModelLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="SearchModelLabel"></h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
          <span aria-hidden="true"></span>
        </button>
      </div>
      <div class="modal-body" id="modal-body-space">
      </div>
      <div class="modal-footer" id="modal-body-space-buttons">
      </div>
    </div>
  </div>
</div>
<br>
<footer class="footer mt-auto py-3 text-muted ${UI.footer_style_class}" style="${UI.fixed_footer ?'position: fixed; ': ''}left: 0; bottom: 0; width: 100%; color: white; z-index: 9999;"> <div class="container" style="width: auto; padding: 0 10px;"> <p class="float-end"> <a href="#">Back to top</a> </p> ${UI.credit ? '<p>Redesigned with <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart-fill" fill="red" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" /> </svg> by <a href="https://github.com/ParveenBhadooOfficial/Google-Drive-Index" target="_blank">TheFirstSpeedster</a>, based on Open Source Softwares.</p>' : ''} <p> ${UI.footnote} </p> </div> </footer>
  `;
    $('body').html(html);
}

const Os = {
    isWindows: navigator.platform.toUpperCase().indexOf('WIN') > -1, // .includes
    isMac: navigator.platform.toUpperCase().indexOf('MAC') > -1,
    isMacLike: /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform),
    isIos: /(iPhone|iPod|iPad)/i.test(navigator.platform),
    isMobile: /Android|webOS|iPhone|iPad|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

function getDocumentHeight() {
    var D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
}

// Was: Function to Decode Encoded JSON Data

function render(path) {
    if (path.indexOf("?") > 0) {
        path = path.substr(0, path.indexOf("?"));
    }
    title(path);
    nav(path);
    // .../0: This
    var reg = /\/\d+:$/g;
    if (window.MODEL.is_search_page) {
        // Used to store the state of some scroll events
        window.scroll_status = {
            // Whether the scroll event is bound
            event_bound: false,
            // "Scroll to the bottom, loading more data" event lock
            loading_lock: false
        };
        render_search_result_list()
    } else if (path.match(reg) || path.substr(-1) == '/') {
        // Used to store the state of some scroll events
        window.scroll_status = {
            // Whether the scroll event is bound
            event_bound: false,
            // "Scroll to the bottom, loading more data" event lock
            loading_lock: false
        };
        list(path);
    } else {
        file(path);
    }
}


// Render title
function title(path) {
    path = decodeURI(path);
    var cur = window.current_drive_order || 0;
    var drive_name = window.drive_names[cur];
    path = path.replace(`/${cur}:`, '');
    // $('title').html(document.siteName + ' - ' + path);
    var model = window.MODEL;
    if (model.is_search_page)
        $('title').html(`${drive_name} - Search results for ${model.q} `);
    else
        $('title').html(`${drive_name} - ${path}`);
}

// Render the navigation bar
function nav(path) {
    var model = window.MODEL;
    var html = "";
    var cur = window.current_drive_order || 0;
    html += `<nav class="navbar navbar-expand-lg${UI.fixed_header ?' fixed-top': ''} ${UI.header_style_class}">
    <div class="container-fluid">
  <a class="navbar-brand" href="/${cur}:/">${UI.logo_image ? '<img border="0" alt="'+UI.company_name+'" src="'+UI.logo_link_name+'" height="'+UI.height+'" width="'+UI.logo_width+'">' : UI.logo_link_name}</a>
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
      <li class="nav-item">
        <a class="nav-link" href="/${cur}:/">Home</a>
      </li>`;
    var search_text = model.is_search_page ? (model.q || '') : '';
    const isMobile = Os.isMobile;
    var search_bar = `
</ul>
<form class="d-flex" method="get" action="/${cur}:search">
<input class="form-control me-2" name="q" type="search" placeholder="Search" aria-label="Search" value="${search_text}" required>
<button class="btn ${UI.search_button_class}" onclick="if($('#search_bar_form>input').val()) $('#search_bar_form').submit();" type="submit">Search</button>
</form>
</div>
</div>
</nav>
`;

    // Personal or team
    if (model.root_type < 2) {
        // Show search box
        html += search_bar;
    }

    $('#nav').html(html);
}

/**
 * Initiate POST request for listing
 * @param path Path
 * @param params Form params
 * @param resultCallback Success Result Callback
 * @param authErrorCallback Pass Error Callback
 */
function requestListPath(path, params, resultCallback, authErrorCallback) {
    var p = {
        password: params['password'] || null,
        page_token: params['page_token'] || null,
        page_index: params['page_index'] || 0
    };
    $.post(path, p, function(data, status) {
        var res = jQuery.parseJSON(data);
        if (res && res.error && res.error.code == '401') {
            // Password verification failed
            if (authErrorCallback) authErrorCallback(path)
        } else if (res && res.data) {
            if (resultCallback) resultCallback(res, path, p)
        }
    })
}

/**
 * Search POST request
 * @param params Form params
 * @param resultCallback Success callback
 */
function requestSearch(params, resultCallback) {
    var p = {
        q: params['q'] || null,
        page_token: params['page_token'] || null,
        page_index: params['page_index'] || 0
    };
    $.post(`/${window.current_drive_order}:search`, p, function(data, status) {
        var res = jQuery.parseJSON(data);
        if (res && res.data) {
            if (resultCallback) resultCallback(res, p)
        }
    })
}

// Render file list
function list(path) {
  var content = `<div class="container">${UI.fixed_header ?'<br>': ''}
	<div id="update"></div>
    <div id="head_md" style="display:none; padding: 20px 20px;"></div>
    <div class="${UI.path_nav_alert_class} d-flex align-items-center" role="alert" style="margin-bottom: 0; padding-bottom: 0rem;">`;
  var navlink = '';
  var navfulllink = window.location.pathname;
  var breadbar = '';
  var navarrayde = decodeURIComponent(navfulllink).split('/');
// <li class="breadcrumb-item"><a href="${item}">${navnamecr}</a></li>
  content += `</ol>
  </nav>
  </div>
    <div id="list" class="list-group text-break">
    </div>
  	<div class="${UI.file_count_alert_class} text-center d-none" role="alert" id="count">Total <span class="number text-center"></span> items</div>
    <div id="readme_md" style="display:none; padding: 20px 20px;"></div>
    </div>
    `;
    $('#content').html(content);

    var password = localStorage.getItem('password' + path);
    $('#list').html(`<div class="d-flex justify-content-center"><div class="spinner-border ${UI.loading_spinner_class} m-5" role="status"><span class="sr-only"></span></div></div>`);
    $('#readme_md').hide().html('');
    $('#head_md').hide().html('');

    /**
     * Callback after the column list request successfully returns data
     * The result returned by @param res (object)
     * @param path the requested path
     * @param prevReqParams parameters used in request
     */
    function successResultCallback(res, path, prevReqParams) {

        // Temporarily store nextPageToken and currentPageIndex in the list element
        $('#list')
            .data('nextPageToken', res['nextPageToken'])
            .data('curPageIndex', res['curPageIndex']);

        // Remove loading spinner
        $('#spinner').remove();

        if (res['nextPageToken'] === null) {
            // If it is the last page, unbind the scroll event, reset scroll_status, and append the data
            $(window).off('scroll');
            window.scroll_status.event_bound = false;
            window.scroll_status.loading_lock = false;
            append_files_to_list(path, res['data']['files']);
        } else {
            // If it is not the last page, append data and bind the scroll event (if not already bound), update scroll_status
            append_files_to_list(path, res['data']['files']);
            if (window.scroll_status.event_bound !== true) {
                // Bind event, if not yet bound
                $(window).on('scroll', function() {
                    var scrollTop = $(this).scrollTop();
                    var scrollHeight = getDocumentHeight();
                    var windowHeight = $(this).height();
                    // Roll to the bottom
                    if (scrollTop + windowHeight > scrollHeight - (Os.isMobile ? 130 : 80)) {
                        /*
                            When the event of scrolling to the bottom is triggered, if it is already loading at this time, the event is ignored;
                            Otherwise, go to loading and occupy the loading lock, indicating that loading is in progress
                         */
                        if (window.scroll_status.loading_lock === true) {
                            return;
                        }
                        window.scroll_status.loading_lock = true;

                        // Show a loading spinner
                        $(`<div id="spinner" class="d-flex justify-content-center"><div class="spinner-border ${UI.loading_spinner_class} m-5" role="status"><span class="sr-only"></span></div></div>`)
                            .insertBefore('#readme_md');

                        let $list = $('#list');
                        requestListPath(path, {
                                password: prevReqParams['password'],
                                page_token: $list.data('nextPageToken'),
                                // Request next page
                                page_index: $list.data('curPageIndex') + 1
                            },
                            successResultCallback,
                            // The password is the same as before. No authError
                            null
                        )
                    }
                });
                window.scroll_status.event_bound = true
            }
        }

        // After loading successfully and rendering new data successfully, release the loading lock so that you can continue to process the "scroll to bottom" event
        if (window.scroll_status.loading_lock === true) {
            window.scroll_status.loading_lock = false
        }
    }

    // Start requesting data from page 1
    requestListPath(path, {
            password: password
        },
        successResultCallback,
        function(path) {
            $('#spinner').remove();
            var pass = prompt("Directory encryption, please enter the password", "");
            localStorage.setItem('password' + path, pass);
            if (pass != null && pass != "") {
                list(path);
            } else {
                history.go(-1);
            }
        });
}

/**
 * Append the data of the requested new page to the list
 * @param path
 * @param files request result
 */
function append_files_to_list(path, files) {
    var $list = $('#list');
    // Is it the last page of data?
    var is_lastpage_loaded = null === $list.data('nextPageToken');
    var is_firstpage = '0' == $list.data('curPageIndex');

    html = "";
    let targetFiles = [];
    for (i in files) {
        var item = files[i];
        var ep = item.name + '/';
        var p = path + ep.replace(new RegExp('#', 'g'), '%23').replace(new RegExp('\\?', 'g'), '%3F');
        if (item['size'] == undefined) {
            item['size'] = "";
        }

        item['modifiedTime'] = utc2delhi(item['modifiedTime']);
        item['size'] = formatFileSize(item['size']);
        if (item['mimeType'] == 'application/vnd.google-apps.folder') {
            html += `<a href="${p}" style="color: ${UI.folder_text_color};" class="list-group-item list-group-item-action">📁 ${item.name} ${UI.display_time ? `<span class="badge bg-info float-end"> ` + item['modifiedTime'] + ` </span>` : ``}</a>`;
        } else {
            var epn = item.name;
            var p = UI.second_domain_for_dl ? UI.downloaddomain + path + epn.replace(new RegExp('#', 'g'), '%23').replace(new RegExp('\\?', 'g'), '%3F') : window.location.origin + path + epn.replace(new RegExp('#', 'g'), '%23').replace(new RegExp('\\?', 'g'), '%3F');
            var pn = path + epn.replace(new RegExp('#', 'g'), '%23').replace(new RegExp('\\?', 'g'), '%3F');
            var filepath = path + item.name;
            var c = "file";
            // README is displayed after the last page is loaded, otherwise it will affect the scroll event
            if (is_lastpage_loaded && item.name == "README.md" && UI.render_readme_md) {
                get_file(p, item, function(data) {
                    markdown("#readme_md", data);
                    $("img").addClass("img-fluid")
                });
            }
            if (item.name == "HEAD.md" && UI.render_head_md) {
                get_file(p, item, function(data) {
                    markdown("#head_md", data);
                    $("img").addClass("img-fluid")
                });
            }
            var ext = p.split('.').pop().toLowerCase();
            //if ("|html|php|css|go|java|js|json|txt|sh|md|mp4|webm|avi|bmp|jpg|jpeg|png|gif|m4a|mp3|flac|wav|ogg|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|pdf|".indexOf(`|${ext}|`) >= 0) {
                //targetFiles.push(filepath);
                pn += "?a=view";
                c += " view";
            //}
            html += `<div class="list-group-item list-group-item-action">`

            if ("|mp4|webm|avi|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|".indexOf(`|${ext}|`) >= 0) {
                html += `🎬 `
              }
              else if ("|html|php|css|go|java|js|json|txt|sh|".indexOf(`|${ext}|`) >= 0) {
                html += `📋 `
              }
              else if ("|zip|".indexOf(`|${ext}|`) >= 0) {
                html += `📦 `
              }
              else if ("|rar|".indexOf(`|${ext}|`) >= 0) {
                html += `📦 `
              }
              else if ("|tar|.7z|.gz|".indexOf(`|${ext}|`) >= 0) {
                html += `📦 `
              }
              else if ("|bmp|jpg|jpeg|png|gif|".indexOf(`|${ext}|`) >= 0) {
                html += `📷 `
              }
              else if ("|m4a|mp3|flac|wav|ogg|".indexOf(`|${ext}|`) >= 0) {
                html += `🎧 `
              }
              else if ("|md|".indexOf(`|${ext}|`) >= 0) {
                html += `📜 `
              }
              else if ("|pdf|".indexOf(`|${ext}|`) >= 0) {
                html += `📃 `
              }
              else {
                html += `📄 `
              }

            html += ` <a class="list-group-item-action" style="text-decoration: none; color: ${UI.css_a_tag_color};" href="${pn}">${item.name}</a>${UI.display_download ? `<a href="${p}"><svg class="float-end"width="25px" style="margin-left: 8px;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"> <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"></path> <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"></path> </svg></a>` : ``}${UI.display_size ? `<span class="badge bg-primary float-end"> ` + item['size'] + ` </span>` : ``}${UI.display_time ? ` <span class="badge bg-info float-end"> ` + item['modifiedTime'] + ` </span>` : ``}</div>`;
        }
    }

    /*let targetObj = {};
    targetFiles.forEach((myFilepath, myIndex) => {
        if (!targetObj[myFilepath]) {
            targetObj[myFilepath] = {
                filepath: myFilepath,
                prev: myIndex === 0 ? null : targetFiles[myIndex - 1],
                next: myIndex === targetFiles.length - 1 ? null : targetFiles[myIndex + 1],
            }
        }
    })
    // console.log(targetObj)
    if (Object.keys(targetObj).length) {
        localStorage.setItem(path, JSON.stringify(targetObj));
        // console.log(path)
    }*/

    if (targetFiles.length > 0) {
        let old = localStorage.getItem(path);
        let new_children = targetFiles;
        // Reset on page 1; otherwise append
        if (!is_firstpage && old) {
            let old_children;
            try {
                old_children = JSON.parse(old);
                if (!Array.isArray(old_children)) {
                    old_children = []
                }
            } catch (e) {
                old_children = [];
            }
            new_children = old_children.concat(targetFiles)
        }

        localStorage.setItem(path, JSON.stringify(new_children))
    }

    // When it is page 1, remove the horizontal loading bar
    $list.html(($list.data('curPageIndex') == '0' ? '' : $list.html()) + html);
    // When it is the last page, count and display the total number of items
    if (is_lastpage_loaded) {
        $('#count').removeClass('d-none').find('.number').text($list.find('a.list-group-item-action').length);
    }
}

/**
 * Render the search results list. There is a lot of repetitive code, but there are different logics in it.
 */
function render_search_result_list() {
    var content = `
  <div class="container"><br>
  <div class="card">
  <div class="${UI.path_nav_alert_class} d-flex align-items-center" role="alert" style="margin-bottom: 0;">Search Results</div>
  <div id="list" class="list-group text-break">
  </div>
  </div>
  <div class="${UI.file_count_alert_class} text-center d-none" role="alert" id="count">Total <span class="number text-center"></span> items</div>
  <div id="readme_md" style="display:none; padding: 20px 20px;"></div>
  </div>
  `;
    $('#content').html(content);

    $('#list').html(`<div class="d-flex justify-content-center"><div class="spinner-border ${UI.loading_spinner_class} m-5" role="status"><span class="sr-only"></span></div></div>`);
    $('#readme_md').hide().html('');
    $('#head_md').hide().html('');

    /**
     * Callback after successful search request returns data
     * The result returned by @param res (object)
     * @param path the requested path
     * @param prevReqParams parameters used in request
     */
    function searchSuccessCallback(res, prevReqParams) {

        // Temporarily store nextPageToken and currentPageIndex in the list element
        $('#list')
            .data('nextPageToken', res['nextPageToken'])
            .data('curPageIndex', res['curPageIndex']);

        // Remove loading spinner
        $('#spinner').remove();

        if (res['nextPageToken'] === null) {
            // If it is the last page, unbind the scroll event, reset scroll_status, and append the data
            $(window).off('scroll');
            window.scroll_status.event_bound = false;
            window.scroll_status.loading_lock = false;
            append_search_result_to_list(res['data']['files']);
        } else {
            // If it is not the last page, append data and bind the scroll event (if not already bound), update scroll_status
            append_search_result_to_list(res['data']['files']);
            if (window.scroll_status.event_bound !== true) {
                // Bind event, if not yet bound
                $(window).on('scroll', function() {
                    var scrollTop = $(this).scrollTop();
                    var scrollHeight = getDocumentHeight();
                    var windowHeight = $(this).height();
                    // Roll to the bottom
                    if (scrollTop + windowHeight > scrollHeight - (Os.isMobile ? 130 : 80)) {
                        /*
     When the event of scrolling to the bottom is triggered, if it is already loading at this time, the event is ignored;
                 Otherwise, go to loading and occupy the loading lock, indicating that loading is in progress
             */
                        if (window.scroll_status.loading_lock === true) {
                            return;
                        }
                        window.scroll_status.loading_lock = true;

                        // Show a loading spinner
                        $(`<div id="spinner" class="d-flex justify-content-center"><div class="spinner-border ${UI.loading_spinner_class} m-5" role="status"><span class="sr-only"></span></div></div>`)
                            .insertBefore('#readme_md');

                        let $list = $('#list');
                        requestSearch({
                                q: window.MODEL.q,
                                page_token: $list.data('nextPageToken'),
                                // Request next page
                                page_index: $list.data('curPageIndex') + 1
                            },
                            searchSuccessCallback
                        )
                    }
                });
                window.scroll_status.event_bound = true
            }
        }

        // After loading successfully and rendering new data successfully, release the loading lock so that you can continue to process the "scroll to bottom" event
        if (window.scroll_status.loading_lock === true) {
            window.scroll_status.loading_lock = false
        }
    }

    // Start requesting data from page 1
    requestSearch({
        q: window.MODEL.q
    }, searchSuccessCallback);
}

/**
 * Append a new page of search results
 * @param files
 */
function append_search_result_to_list(files) {
    var cur = window.current_drive_order || 0;
    var $list = $('#list');
    // Is it the last page of data?
    var is_lastpage_loaded = null === $list.data('nextPageToken');
    // var is_firstpage = '0' == $list.data('curPageIndex');

    html = "";

    for (i in files) {
        var item = files[i];
        var p = '/' + cur + ':/' + item.name + '/';
        if (item['size'] == undefined) {
            item['size'] = "";
        }

        item['modifiedTime'] = utc2delhi(item['modifiedTime']);
        item['size'] = formatFileSize(item['size']);
        if (item['mimeType'] == 'application/vnd.google-apps.folder') {
            html += `<a style="color: ${UI.folder_text_color};" onclick="onSearchResultItemClick(this)" data-bs-toggle="modal" data-bs-target="#SearchModel" id="${item['id']}" class="list-group-item list-group-item-action">📁  ${item.name} ${UI.display_time ? `<span class="badge bg-info float-end"> ` + item['modifiedTime'] + ` </span>` : ``}</a>`;
        } else {
            var p = '/' + cur + ':/' + item.name;
            var c = "file";
            var ext = item.name.split('.').pop().toLowerCase();
            if ("|html|php|css|go|java|js|json|txt|sh|md|mp4|webm|avi|bmp|jpg|jpeg|png|gif|m4a|mp3|flac|wav|ogg|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|".indexOf(`|${ext}|`) >= 0) {
                p += "?a=view";
                c += " view";
            }
            html += `<a style="color: ${UI.css_a_tag_color};" onclick="onSearchResultItemClick(this)" data-bs-toggle="modal" data-bs-target="#SearchModel" id="${item['id']}" gd-type="${item.mimeType}" class="list-group-item list-group-item-action">`

            if ("|mp4|webm|avi|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|".indexOf(`|${ext}|`) >= 0) {
              html += `🎬 `
            }
            else if ("|html|php|css|go|java|js|json|txt|sh|".indexOf(`|${ext}|`) >= 0) {
              html += `📋 `
            }
            else if ("|zip|".indexOf(`|${ext}|`) >= 0) {
              html += `📦 `
            }
            else if ("|rar|".indexOf(`|${ext}|`) >= 0) {
              html += `📦 `
            }
            else if ("|tar|.7z|.gz|".indexOf(`|${ext}|`) >= 0) {
              html += `📦 `
            }
            else if ("|bmp|jpg|jpeg|png|gif|".indexOf(`|${ext}|`) >= 0) {
              html += `📷 `
            }
            else if ("|m4a|mp3|flac|wav|ogg|".indexOf(`|${ext}|`) >= 0) {
              html += `🎧 `
            }
            else if ("|md|".indexOf(`|${ext}|`) >= 0) {
              html += `📜 `
            }
            else if ("|pdf|".indexOf(`|${ext}|`) >= 0) {
              html += `📃 `
            }
            else {
              html += `📄 `
            }

            html += ` ${item.name}<span class="badge float-end csize"> ${UI.display_size ? `<span class="badge bg-primary float-end"> ` + item['size'] + ` </span>` : ``}${UI.display_time ? ` <span class="badge bg-info float-end"> ` + item['modifiedTime'] + ` </span>` : ``}</a>`;
        }
    }

    // When it is page 1, remove the horizontal loading bar
    $list.html(($list.data('curPageIndex') == '0' ? '' : $list.html()) + html);
    // When it is the last page, count and display the total number of items
    if (is_lastpage_loaded) {
        $('#count').removeClass('d-none').find('.number').text($list.find('a.list-group-item').length);
    }
}

/**
 * Search result item click event
 * @param a_ele Clicked element
 */
function onSearchResultItemClick(a_ele) {
    var me = $(a_ele);
    var can_preview = me.hasClass('view');
    var cur = window.current_drive_order;
    var title = `Loading...`;
    $('#SearchModelLabel').html(title);
    var content = `<div class="d-flex justify-content-center"><div class="spinner-border ${UI.loading_spinner_class} m-5" role="status"><span class="sr-only"></span></div>`;
    $('#modal-body-space').html(content);

    // Request a path
    $.post(`/${cur}:id2path`, {
        id: a_ele.id
    }, function(data) {
        if (data) {
            var href = `/${cur}:${data}${can_preview ? '?a=view' : ''}`;
            if (href.endsWith("/")) {
                var ehrefurl = href.replace(new RegExp('#', 'g'), '%23').replace(new RegExp('\\?', 'g'), '%3F');
            } else {
                var ehrefurl = href.replace(new RegExp('#', 'g'), '%23').replace(new RegExp('\\?', 'g'), '%3F') + '?a=view';
            }
            title = `Open File in...`;
            $('#SearchModelLabel').html(title);
            content = `<a class="btn btn-info" href="${ehrefurl}">This Tab</a> <a class="btn btn-secondary" href="${ehrefurl}" target="_blank">New Tab</a>`;
            $('#modal-body-space').html(content);
            return;
        }
        title = `Failed`;
        $('#SearchModelLabel').html(title);
        content = `System Failed to Fetch the File/Folder Link, Please close and try again.`;
        $('#modal-body-space').html(content);
    })
}

function get_file(path, file, callback) {
    var key = "file_path_" + path + file['modifiedTime'];
    var data = localStorage.getItem(key);
    if (data != undefined) {
        return callback(data);
    } else {
        $.get(path, function(d) {
            localStorage.setItem(key, d);
            callback(d);
        });
    }
}

function get_file(path, file, callback) {
    var key = "file_path_" + path + file['modifiedTime'];
    var data = localStorage.getItem(key);
    if (data != undefined) {
        return callback(data);
    } else {
        $.get(path, function(d) {
            localStorage.setItem(key, d);
            callback(d);
        });
    }
}

// File display ?a=view
function file(path) {
    var name = path.split('/').pop();
    var ext = name.split('.').pop().toLowerCase().replace(`?a=view`, "").toLowerCase();
    $('#content').html(`<div class="d-flex justify-content-center" style="height: 150px"><div class="spinner-border ${UI.loading_spinner_class} m-5" role="status"><span class="sr-only"></span></div></div>`);
    if ("|html|php|css|go|java|js|json|txt|sh|md|".indexOf(`|${ext}|`) >= 0) {
        return file_code(path);
    }

    if ("|mp4|webm|avi|".indexOf(`|${ext}|`) >= 0) {
        return file_video(path);
    }

    if ("|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|".indexOf(`|${ext}|`) >= 0) {
        return file_video(path);
    }

    if ("|mp3|flac|wav|ogg|m4a|aac|".indexOf(`|${ext}|`) >= 0) {
        return file_audio(path);
    }

    if ("|bmp|jpg|jpeg|png|gif|".indexOf(`|${ext}|`) >= 0) {
        return file_image(path);
    }

    if ('pdf' === ext) {
        return file_pdf(path);
    } else {
        return file_others(path);
    }
}

// Document display |zip|.exe/others direct downloads
function file_others(path) {
    var type = {
        "zip": "zip",
        "exe": "exe",
        "rar": "rar",
    };
    var name = path.split('/').pop();
    var decodename = unescape(name);
    var ext = name.split('.').pop().toLowerCase();
    var path = path;
    var url = UI.second_domain_for_dl ? UI.downloaddomain + path : window.location.origin + path;
    $.post("",
    function(data){
    var obj = jQuery.parseJSON(data);
    var size = formatFileSize(obj.size);
    var content = `
<div class="container"><br>
<div class="card text-center">
<div class="card-body text-center">
  <div class="${UI.file_view_alert_class}" id="file_details" role="alert">${obj.name}<br>${size}</div>
</div>
<div class="card-body">
<div class="input-group mb-4">
  <div class="input-group-prepend">
    <span class="input-group-text" style="display: none;" id="">DDL Link</span>
  </div>
  <input type="text" class="form-control" style="display: none;" id="dlurl" value="${url}">
</div>
	<div class="card-text text-center">
  ${UI.display_drive_link ? '<a type="button" class="btn btn-info" href="https://drive.google.com/file/d/'+ obj.id +'/view" id ="file_drive_link" target="_blank">GD Link</a>': ''}
  <div class="btn-group text-center">
      <a href="${url}" type="button" class="btn btn-primary">Download</a>
  </div>
  </div>
  <br></div>`;
    $('#content').html(content);
    });
}

// Document display |html|php|css|go|java|js|json|txt|sh|md|
function file_code(path) {
    var type = {
        "html": "html",
        "php": "php",
        "css": "css",
        "go": "golang",
        "java": "java",
        "js": "javascript",
        "json": "json",
        "txt": "Text",
        "sh": "sh",
        "md": "Markdown",
    };
    var name = path.split('/').pop();
    var decodename = unescape(name);
    var ext = name.split('.').pop().toLowerCase();
    var path = path;
    var url = UI.second_domain_for_dl ? UI.downloaddomain + path : window.location.origin + path;
    $.post("",
    function(data){
    var obj = jQuery.parseJSON(data);
    var size = formatFileSize(obj.size);
    var content = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.23.0/themes/prism-twilight.css" integrity="sha256-Rl83wx+fN2p2ioYpdvpWxuhAbxj+/7IwaZrKQBu/KQE=" crossorigin="anonymous">
<div class="container"><br>
<div class="card text-center">
<div class="card-body text-center">
  <div class="${UI.file_view_alert_class}" id="file_details" role="alert">${obj.name}<br>${size}</div>
<div>
<pre class="line-numbers language-markup" data-src="plugins/line-numbers/index.html" data-start="-5" style="white-space: pre-wrap; counter-reset: linenumber -6;" data-src-status="loaded" tabindex="0"><code id="editor"></code></pre>
</div>
</div>
<div class="card-body">
<div class="input-group mb-4">
  <div class="input-group-prepend">
    <span class="input-group-text" style="display: none;" id="">DDL Link</span>
  </div>
  <input type="text" class="form-control" style="display: none;" id="dlurl" value="${url}">
</div>
	<div class="card-text text-center">
  ${UI.display_drive_link ? '<a type="button" class="btn btn-info" href="https://drive.google.com/file/d/'+ obj.id +'/view" id ="file_drive_link" target="_blank">GD Link</a>': ''}
  <div class="btn-group text-center">
      <a href="${url}" type="button" class="btn btn-primary">Download</a>
  </div></div>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.23.0/prism.js" integrity="sha256-fZOd7N/oofoKcO92RzxvC0wMm+EvsKyRT4nmcmQbgzU=" crossorigin="anonymous"></script>
`;
    $('#content').html(content);
    });

    $.get(path, function(data) {
        $('#editor').html($('<div/><div/><div/>').text(data).html());
        var code_type = "Text";
        if (type[ext] != undefined) {
            code_type = type[ext];
        }
    });
}

// Document display video |mp4|webm|avi|
function file_video(path) {
    var name = path.split('/').pop();
    var decodename = unescape(name);
    var caption = name.slice(0, name.lastIndexOf('.'))
    var path = path;
    var url = UI.second_domain_for_dl ? UI.downloaddomain + path : window.location.origin + path;
    var url_without_https = url.replace(/^(https?:|)\/\//,'')
    var url_base64 = btoa(url)
    $.post("",
    function(data){
    var obj = jQuery.parseJSON(data);
    var size = formatFileSize(obj.size);
		if (obj.thumbnailLink != null){
    var poster = obj.thumbnailLink.slice(0, -5);
		}
		else {
		var poster = UI.poster;
		}
    var content = `
  <div class="container text-center"><br>
  <div class="card text-center">
  <div class="text-center">
  <div class="${UI.file_view_alert_class}" id="file_details" role="alert">${obj.name}<br>${size}</div>
	<video id="vplayer" width="100%" height="100%" playsinline controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen']; data-plyr-config="{ "title": "${decodename}"}" data-poster="${poster}" style="--plyr-captions-text-color: #ffffff;--plyr-captions-background: #000000;">
	  <source src="${url}" type="video/mp4" />
	  <source src="${url}" type="video/webm" />
  </div>
	${UI.disable_player ? '<style>.plyr{display:none;}</style>' : ''}
  <script>
   const player = new Plyr('#vplayer',{ratio: "${UI.plyr_io_video_resolution}"});
  </script></br>
${UI.disable_video_download ? `` : `
<div class="card-body">
<div class="input-group mb-4">
  <div class="input-group-prepend">
    <span class="input-group-text" style="display: none;" id="">DDL Link</span>
  </div>
  <input type="text" class="form-control" style="display: none;" id="dlurl" value="${url}">
</div>
${UI.display_drive_link ? '<a type="button" class="btn btn-info" href="https://drive.google.com/file/d/'+ obj.id +'/view" id ="file_drive_link" target="_blank">GD Link</a>': ''}
<div class="btn-group text-center">
    <a href="${url}" type="button" class="btn btn-primary">Download</a>
</div>
<br>
  </div>
  </div>
  `}
  </div>
  `;$('#content').html(content);
  });

}

// File display Audio |mp3|flac|m4a|wav|ogg|
function file_audio(path) {
    var name = path.split('/').pop();
    var decodename = unescape(name);
    var path = path;
    var url = UI.second_domain_for_dl ? UI.downloaddomain + path : window.location.origin + path;
    $.post("",
    function(data){
    var obj = jQuery.parseJSON(data);
    var size = formatFileSize(obj.size);
    var content = `
  <div class="container"><br>
  <div class="card">
  <div class="card-body text-center">
  <div class="${UI.file_view_alert_class}" id="file_details" role="alert">${obj.name}<br>${size}</div>
  <br><img draggable="false" src="${UI.audioposter}" width="100%" /><br>
  <audio id="vplayer" width="100%" playsinline controls>
    <source src="${url}" type="audio/ogg">
    <source src="${url}" type="audio/mpeg">
  Your browser does not support the audio element.
  </audio>
  </div>
	${UI.disable_player ? '<style>.plyr{display:none;}</style>' : ''}
  <script>
   const player = new Plyr('#vplayer');
  </script></br>
  <div class="card-body">
<div class="input-group mb-4">
  <div class="input-group-prepend">
    <span class="input-group-text" style="display: none;" id="">DDL Link</span>
  </div>
  <input type="text" class="form-control" style="display: none;" id="dlurl" value="${url}">
</div>
	<div class="card-text text-center">
  ${UI.display_drive_link ? '<a type="button" class="btn btn-info" href="https://drive.google.com/file/d/'+ obj.id +'/view" id ="file_drive_link" target="_blank">GD Link</a>': ''}
  <div class="btn-group text-center">
      <a href="${url}" type="button" class="btn btn-primary">Download</a>
  </div>
  </div>
  </div>
  </div>
  `;
    $('#content').html(content);
    });
}

// Document display pdf
function file_pdf(path) {
    var name = path.split('/').pop();
    var decodename = unescape(name);
    var path = path;
    var url = UI.second_domain_for_dl ? UI.downloaddomain + path : window.location.origin + path;
    var inline_url = `${url}?inline=true`
    $.post("",
    function(data){
    var obj = jQuery.parseJSON(data);
    var size = formatFileSize(obj.size);
    var content = `
  <script>
  var url = "https://" + window.location.hostname + window.location.pathname;
  var pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdn.jsdelivr.net/gh/mozilla/pdf.js@gh-pages/build/pdf.worker.js';
  var pdfDoc = null,
      pageNum = 1,
      pageRendering = false,
      pageNumPending = null,
      scale = 0.8,
      canvas = document.getElementById('the-canvas'),
      ctx = canvas.getContext('2d');
  function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
      var viewport = page.getViewport({scale: scale});
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);
      renderTask.promise.then(function() {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });
    document.getElementById('page_num').textContent = num;
  }
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }
  function onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  }
  document.getElementById('prev').addEventListener('click', onPrevPage);
  function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  }
  document.getElementById('next').addEventListener('click', onNextPage);
  pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;
    renderPage(pageNum);
  });
  </script>
  <div class="container"><br>
  <div class="card">
  <div class="card-body text-center">
  <div class="${UI.file_view_alert_class}" id="file_details" role="alert">${obj.name}<br>${size}</div>
  <div>
  <button id="prev" class="btn btn-info">Previous</button>
  <button id="next" class="btn btn-info">Next</button>
  &nbsp; &nbsp;
  <span>Page: <span id="page_num"></span> / <span id="page_count"></span></span>
  </div><br>
  <canvas id="the-canvas" style="max-width: 100%;"></canvas>
  </div>
  <div class="card-body">
<div class="input-group mb-4">
  <div class="input-group-prepend">
    <span class="input-group-text" style="display: none;" id="">DDL Link</span>
  </div>
  <input type="text" class="form-control" style="display: none;" id="dlurl" value="${url}">
</div>
	<div class="card-text text-center">
  ${UI.display_drive_link ? '<a type="button" class="btn btn-info" href="https://drive.google.com/file/d/'+ obj.id +'/view" id ="file_drive_link" target="_blank">GD Link</a>': ''}
  <div class="btn-group text-center">
      <a href="${url}" type="button" class="btn btn-primary">Download</a>
  </div>
  </div>
  </div>
  </div>
  `;
    $('#content').html(content);
    });
}

// image display
function file_image(path) {
    var name = path.split('/').pop();
    var decodename = unescape(name);
    var path = path;
    var url = UI.second_domain_for_dl ? UI.downloaddomain + path : window.location.origin + path;
    // console.log(window.location.pathname)
    const currentPathname = window.location.pathname
    const lastIndex = currentPathname.lastIndexOf('/');
    const fatherPathname = currentPathname.slice(0, lastIndex + 1);
    // console.log(fatherPathname)
    let target_children = localStorage.getItem(fatherPathname);
    // console.log(`fatherPathname: ${fatherPathname}`);
    // console.log(target_children)
    let targetText = '';
    if (target_children) {
      try {
        target_children = JSON.parse(target_children);
        if (!Array.isArray(target_children)) {
          target_children = []
        }
      } catch (e) {
        console.error(e);
        target_children = [];
      }
      if (target_children.length > 0 && target_children.includes(path)) {
        let len = target_children.length;
        let cur = target_children.indexOf(path);
        // console.log(`len = ${len}`)
        // console.log(`cur = ${cur}`)
        let prev_child = (cur - 1 > -1) ? target_children[cur - 1] : null;
        let next_child = (cur + 1 < len) ? target_children[cur + 1] : null;
          if (prev_child == null) {
              var prevchild = false;
          }
          else if (prev_child.endsWith(".jpg") == true || prev_child.endsWith(".png") || prev_child.endsWith(".jpeg") || prev_child.endsWith(".gif")){
      		    var prevchild = true;
      		}
          if (next_child == null) {
              var nextchild = false;
          }
      		else if (next_child.endsWith(".jpg") == true || next_child.endsWith(".png") || next_child.endsWith(".jpeg") || next_child.endsWith(".gif")){
      		    var nextchild = true;
      		}
            targetText = `

                              ${prevchild ? `<a class="btn btn-primary" href="${prev_child}?a=view" role="button">Previous</a>` : ``}

                              ${nextchild ? `<a class="btn btn-primary" href="${next_child}?a=view" role="button">Next</a>` : ``}

                  `;
    }
          }
    $.post("",
    function(data){
    var obj = jQuery.parseJSON(data);
    var size = formatFileSize(obj.size);
    var content = `
  <div class="container"><br>
  <div class="card">
  <div class="card-body text-center">
  <div class="${UI.file_view_alert_class}" id="file_details" role="alert">${obj.name}<br>${size}</div>
  <div>${targetText}</div><br>
  <img src="${url}" width="50%">
  </div>
  <div class="card-body">
<div class="input-group mb-4">
  <div class="input-group-prepend">
    <span class="input-group-text" style="display: none;" id="">DDL Link</span>
  </div>
  <input type="text" class="form-control" style="display: none;" id="dlurl" value="${url}">
</div>
	<div class="card-text text-center">
  ${UI.display_drive_link ? '<a type="button" class="btn btn-info" href="https://drive.google.com/file/d/'+ obj.id +'/view" id ="file_drive_link" target="_blank">GD Link</a>': ''}
  <div class="btn-group text-center">
      <a href="${url}" type="button" class="btn btn-primary">Download</a>
  </div>
  </div>
  </div>
  </div>
    `;
    // my code
    $('#content').html(content);
    });
    $('#leftBtn, #rightBtn').click((e) => {
        let target = $(e.target);
        if (['I', 'SPAN'].includes(e.target.nodeName)) {
            target = $(e.target).parent();
        }
        const filepath = target.attr('data-filepath');
        const direction = target.attr('data-direction');
        //console.log(`${direction}Turn page ${filepath}`);
        file(filepath)
    });
}


// Time conversion
function utc2delhi(utc_datetime) {
    // Convert to normal time format year-month-day hour: minute: second
    var T_pos = utc_datetime.indexOf('T');
    var Z_pos = utc_datetime.indexOf('Z');
    var year_month_day = utc_datetime.substr(0, T_pos);
    var hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
    var new_datetime = year_month_day + " " + hour_minute_second; // 2017-03-31 08:02:06

    // Processing becomes timestamp
    timestamp = new Date(Date.parse(new_datetime));
    timestamp = timestamp.getTime();
    timestamp = timestamp / 1000;

    // 5.5 hours increase, India time is five and half more time zones than UTC time
    var unixtimestamp = timestamp + 5.5 * 60 * 60;

    // Timestamp to time
    var unixtimestamp = new Date(unixtimestamp * 1000);
    var year = 1900 + unixtimestamp.getYear();
    var month = "0" + (unixtimestamp.getMonth() + 1);
    var date = "0" + unixtimestamp.getDate();
    var hour = "0" + unixtimestamp.getHours();
    var minute = "0" + unixtimestamp.getMinutes();
    var second = "0" + unixtimestamp.getSeconds();
    return year + "-" + month.substring(month.length - 2, month.length) + "-" + date.substring(date.length - 2, date.length) +
        " " + hour.substring(hour.length - 2, hour.length) + ":" +
        minute.substring(minute.length - 2, minute.length) + ":" +
        second.substring(second.length - 2, second.length);
}

// bytes adaptive conversion to KB, MB, GB
function formatFileSize(bytes) {
    if (bytes >= 1000000000) {
        bytes = (bytes / 1000000000).toFixed(2) + ' GB';
    } else if (bytes >= 1000000) {
        bytes = (bytes / 1000000).toFixed(2) + ' MB';
    } else if (bytes >= 1000) {
        bytes = (bytes / 1000).toFixed(2) + ' KB';
    } else if (bytes > 1) {
        bytes = bytes + ' bytes';
    } else if (bytes == 1) {
        bytes = bytes + ' byte';
    } else {
        bytes = '';
    }
    return bytes;
}

String.prototype.trim = function(char) {
    if (char) {
        return this.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
    }
    return this.replace(/^\s+|\s+$/g, '');
};


// README.md HEAD.md support
function markdown(el, data) {
    var html = marked(data);
    $(el).show().html(html);
}

// Listen for fallback events
window.onpopstate = function() {
    var path = window.location.pathname;
    render(path);
}

// Was: Function to read JSON Data

$(function() {
    init();
    var path = window.location.pathname;
    /*$("body").on("click", '.folder', function () {
        var url = $(this).attr('href');
        history.pushState(null, null, url);
        render(url);
        return false;
    });
    $("body").on("click", '.view', function () {
        var url = $(this).attr('href');
        history.pushState(null, null, url);
        render(url);
        return false;
    });*/

    render(path);
});

// Was: Copy to Clipboard for Direct Links.
