// ===============================
// HTML ESCAPE FUNCTION
// ===============================

function escapeHtml(text) {
    if (text === null || text === undefined) {
        return '';
    }

    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}



function getApiUrl(action, extra = {}) {

    const params = new URLSearchParams();

    params.set('action', action);
    params.set('key', API_KEY);

    Object.keys(extra).forEach(function(key) {

        params.set(
            key,
            extra[key]
        );

    });

    return API_URL + '?' + params.toString();
}


// ============================================================
// JSONP GET
// ============================================================

function apiGet(action, extra = {}) {

    return new Promise(function(resolve, reject) {

        const callbackName =
            'apiCallback_' +
            Date.now() +
            '_' +
            Math.floor(Math.random() * 100000);


        const script =
            document.createElement('script');


        const timeout =
            setTimeout(function() {

                cleanup();

                reject(
                    new Error(
                        'Server request timed out.'
                    )
                );

            }, 15000);


        window[callbackName] =
            function(data) {

                cleanup();

                resolve(data);

            };


        function cleanup() {

            clearTimeout(timeout);

            delete window[callbackName];

            if (script.parentNode) {

                script.parentNode.removeChild(
                    script
                );

            }

        }


        const params = new URLSearchParams();

        params.set('action', action);

        params.set('key', API_KEY);

        params.set(
            'callback',
            callbackName
        );


        Object.keys(extra).forEach(function(key) {

            params.set(
                key,
                extra[key]
            );

        });


        script.src =
            API_URL +
            '?' +
            params.toString();


        script.onerror =
            function() {

                cleanup();

                reject(
                    new Error(
                        'Could not connect to Apps Script.'
                    )
                );

            };


        document.body.appendChild(script);

    });

}


// ============================================================
// POST
// ============================================================
//
// A hidden iframe is used so the GitHub Pages page does not
// need to read the cross-origin POST response.
//

function apiPost(action, data = {}) {

    return new Promise(function(resolve, reject) {

        const iframeName =
            'postFrame_' +
            Date.now() +
            '_' +
            Math.floor(Math.random() * 100000);


        const iframe =
            document.createElement('iframe');

        iframe.name = iframeName;

        iframe.style.display = 'none';


        const form =
            document.createElement('form');

        form.method = 'POST';

        form.action = API_URL;

        form.target = iframeName;

        form.style.display = 'none';


        addHiddenInput(
            form,
            'action',
            action
        );


        addHiddenInput(
            form,
            'key',
            API_KEY
        );


        Object.keys(data).forEach(function(key) {

            addHiddenInput(
                form,
                key,
                data[key]
            );

        });


        document.body.appendChild(iframe);

        document.body.appendChild(form);


        let finished = false;


        function cleanup() {

            if (form.parentNode) {
                form.parentNode.removeChild(form);
            }

            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }

        }


        iframe.onload =
            function() {

                if (finished) {
                    return;
                }

                finished = true;

                cleanup();

                resolve({
                    success: true
                });

            };


        iframe.onerror =
            function() {

                if (finished) {
                    return;
                }

                finished = true;

                cleanup();

                reject(
                    new Error(
                        'Could not send request.'
                    )
                );

            };


        form.submit();


        // Fallback because some browsers/web-app redirects
        // do not reliably trigger iframe.onload.

        setTimeout(function() {

            if (finished) {
                return;
            }

            finished = true;

            cleanup();

            resolve({
                success: true
            });

        }, 2500);

    });

}


function addHiddenInput(
    form,
    name,
    value
) {

    const input =
        document.createElement('input');

    input.type = 'hidden';

    input.name = name;

    input.value = value;

    form.appendChild(input);
}


// ============================================================
// MENU
// ============================================================

function createMenu(activePage) {
    const menu = document.createElement('div');
    menu.className = 'top-menu-wrapper';

    menu.innerHTML = `
        <button class="menu-toggle" id="menuToggle" title="Show / Hide Menu">
            ☰
        </button>

        <nav class="top-menu" id="topMenu">
            <div class="menu-brand">Offer Manager</div>

            <a href="index.html" class="${activePage === 'offers' ? 'active' : ''}">
                Offers
            </a>

            <a href="mates.html" class="${activePage === 'mates' ? 'active' : ''}">
                Mates
            </a>

            <a href="status.html" class="${activePage === 'status' ? 'active' : ''}">
                Status
            </a>

            <a href="json.html" class="${activePage === 'json' ? 'active' : ''}">
                JSON
            </a>

            <a href="clear.html" class="${activePage === 'clear' ? 'active' : ''}">
                Clear Offers
            </a>
        </nav>
    `;

    document.body.prepend(menu);

    const toggleButton = document.getElementById('menuToggle');
    const topMenu = document.getElementById('topMenu');

    toggleButton.addEventListener('click', function () {
        topMenu.classList.toggle('hidden');
    });
}

// ============================================================
// ERROR DISPLAY
// ============================================================

function showError(error) {

    console.error(error);

    alert(
        error.message ||
        'An error occurred.'
    );

}