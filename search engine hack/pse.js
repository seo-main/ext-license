var log = console.log;
function op(elem) { return document.querySelector(elem) }
function opp(elem) { return document.querySelectorAll(elem) }
var searchInput = {
    onLoaded: () => {
        searchInput.input.addEventListener("change", () => {
            elementOnFind(".gsc-resultsRoot.gsc-tabData.gsc-tabdActive").then(el => {
                updateSuggSections(el)
            })
        })
    }
};
var SUGG = {
    list: [],
    add: (ary) => {
        if (ary.length && !SUGG.list.includes(ary)) {
            SUGG.list.unshift(ary);

            while (SUGG.list.length > 3) {
                SUGG.list.pop();
            }

        }
    },
    getSuggSet: () => {
        return new Set(...SUGG.list);
    }
}
MutationOf(op('#SearchPanReal'), (edits) => { // to modify the search bar appearance
    for (edit of edits) {
        if (edit.addedNodes[0]) {
            if (edit.addedNodes[0] && edit.addedNodes[0].classList.contains("gsib_b")) {
                addSearchBoxIcon(edit.addedNodes[0]);
                searchInput.input = document.querySelector("#SearchPanReal input[name=search]");
                searchInput.onLoaded();
            }
        }

    }
});

elementOnFind(".gsc-tabsArea").then(el => { // to insert other tabs of the search
    var tabs = ['VIDEOS', 'MAPS', 'NEWS', 'COPILOT', 'MORE'];
    var html = '';
    tabs.forEach(val => {
        html += `<div tabindex="0" aria-label="refinement" role="tab" class="gsc-tabHeader gsc-tabhInactive gsc-inline-block">${val}</div><span class="gs-spacer"> </span>`
    })
    el.insertAdjacentHTML("beforeend", html);
})

elementOnFind(".gsc-completion-container").then(el => { // to registerSugg(el);
    MutationOf(el, (edits) => {
        var ary = [];
        el.querySelectorAll("span").forEach(val => {
            ary.push(val.innerText);
        })
        SUGG.add(ary);
    })
})
elementOnFind(".gsc-results.gsc-webResult").then(el => {
    handleResultShow();
    MutationOf(el, (edits) => {
        handleResultShow();
    })
    function handleResultShow() {
        var results = el.querySelectorAll(".gsc-webResult.gsc-result .gsc-url-top");
        if (results.length) {
            updateSuggSections(op(".gsc-resultsRoot.gsc-tabData.gsc-tabdActive"));
        } else {
            removeSuggSection();
        }
    }
})


function removeSuggSection() {
    try {
        opp(".suggParent").forEach(val => { val.remove(); })
    } catch (e) { }
}
function updateSuggSections(el) {
    var set = SUGG.getSuggSet();
    addSidePan(el, SUGG.list[0]);
    addBottomPan(el, Array.from(set));
}

function addSidePan(el, ary = suggAryInitial) {
    if (!ary || !ary.length) return;
    var preExist = op(".suggParent.suggSide");
    if (preExist) preExist.remove();
    var html = `<div class="suggParent suggSide" style="margin-left: 50px; ">
                            <p style='font-size: 1.8em; margin: 30px 0;'>Deep dive into ${searchInput?.input?.value.trim() || productName}</p>
                        <div class="suggBox">`;
    ary.slice(0, 5).forEach(val => {
        html += `<a class="sugg flex" href="#">
                            <img src="https://seo-main.github.io/ext-license/search%20engine%20hack/imgPS/search.svg" class="ico" alt="search icon">
                            <p>
                                <span>${val}</span>
                            </p>
                        </a>`
    });
    html += `</div></div>`;

    el.insertAdjacentHTML("beforeend", html)
}

function addBottomPan(el, ary) {
    if (!ary.length) return;
    var preExist = op(".suggParent.suggBottom");
    if (preExist) preExist.remove();
    var html = `<div class="suggParent suggBottom" style="margin-left: 50px; ">
                <p style='font-size: 1.8em; margin: 30px 0;'>Deep dive into ${searchInput.input.value.trim()}</p>
                <div class="suggBox">

                    <table>`;
    var i = 0;
    while (ary[i]) {
        html += `<tr>`
        html += `<td>
                            <a class="sugg flex" href="#">
                                <img src="https://seo-main.github.io/ext-license/search%20engine%20hack/imgPS/search.svg" class="ico" alt="search icon">
                                <p>
                                    <span>${ary[i]}</span>
                                </p>
                            </a>
                        </td>`
        i++;
        if (ary[i]) {

            html += `<td>
                            <a class="sugg flex" href="#">
                                <img src="https://seo-main.github.io/ext-license/search%20engine%20hack/imgPS/search.svg" class="ico" alt="search icon">
                                <p>
                                    <span>${ary[i]}</span>
                                </p>
                            </a>
                        </td>`
            i++;
        }
        html += `</tr>`
    }

    html += `
            </table>
                    
                </div>
            </div>`;



    el.parentElement.insertAdjacentHTML("beforeend", html)
}

function addSearchBoxIcon(target) {
    target.insertAdjacentHTML("beforeend", `<div class="insearchIcon"><img class="ico" src="https://seo-main.github.io/ext-license/search%20engine%20hack/imgPS/mic.svg">
                <img class="ico" src="https://seo-main.github.io/ext-license/search%20engine%20hack/imgPS/google-lens.svg"></div>
            `)
}
function MutationOf(element, callback) {
    const observer = new MutationObserver((mutationsList) => {
        callback(mutationsList)
    });


    observer.observe(element, {
        childList: true,
        subtree: true
    });

    return observer;
}

function elementOnFind(selector, root = document) {
    return new Promise(resolve => {
        let element = root.querySelector(selector);

        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver(() => {
            const found = root.querySelector(selector);
            if (found) {
                observer.disconnect();
                resolve(found);
            }
        });

        observer.observe(
            root === document ? document.documentElement : root,
            {
                childList: true,
                subtree: true,
                attributes: true
            }
        );
    });
}
