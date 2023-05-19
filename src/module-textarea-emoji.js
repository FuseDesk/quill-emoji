import Quill from 'quill';
import Fuse from 'fuse.js';
import emojiList from './emoji-list.js';
import {fn_showEmojiPalette} from './module-toolbar-emoji.js';

const Delta = Quill.import('delta');
const Module = Quill.import('core/module');

class TextAreaEmoji extends Module {
    constructor(quill, options){
        super(quill, options);

        this.quill = quill;
        this.container  = document.createElement('div');
        this.container.classList.add('textarea-emoji-control');
        this.container.style.position   = "absolute";
        this.container.innerHTML = options.buttonIcon;
        this.quill.container.appendChild(this.container);
        this.container.addEventListener('click', this.checkEmojiBoxExist.bind(this),false);
    }

    checkEmojiBoxExist(){
        let elementExists = document.getElementById("textarea-emoji");
        if (elementExists) {
            elementExists.remove();
        }
        else{
            this.quill.focus()
            fn_showEmojiPalette(this.quill)
        }
    }
}

TextAreaEmoji.DEFAULTS = {
  buttonIcon: '<svg viewbox="0 0 18 18"><circle class="ql-fill" cx="7" cy="7" r="1"></circle><circle class="ql-fill" cx="11" cy="7" r="1"></circle><path class="ql-stroke" d="M7,10a2,2,0,0,0,4,0H7Z"></path><circle class="ql-stroke" cx="9" cy="9" r="6"></circle></svg>'
}

function fn_close(){
    let ele_emoji_plate = document.getElementById('textarea-emoji');
    document.getElementById('emoji-close-div').style.display = "none";
    if (ele_emoji_plate) {ele_emoji_plate.remove()}
}

function fn_updateRange(quill){
    let range = quill.getSelection();
    return range;
}

function fn_emojiPanelInit(panel,quill){
    fn_emojiElementsToPanel('p', panel, quill);
    document.querySelector('.filter-people').classList.add('active');
}

function fn_emojiElementsToPanel(type,panel,quill){
    let fuseOptions = {
                    shouldSort: true,
                    matchAllTokens: true,
                    threshold: 0.3,
                    location: 0,
                    distance: 100,
                    maxPatternLength: 32,
                    minMatchCharLength: 3,
                    keys: [
                        "category"
                    ]
                };
    let fuse = new Fuse(emojiList, fuseOptions);
    let result = fuse.search(type);
    result.sort(function (a, b) {
      return a.emoji_order - b.emoji_order;
    });

    quill.focus();
    let range = fn_updateRange(quill);

    result.map(function(emoji) {
        let span = document.createElement('span');
        let t = document.createTextNode(emoji.shortname);
        span.appendChild(t);
        span.classList.add('bem');
        span.classList.add('bem-' + emoji.name);
        span.classList.add('ap');
        span.classList.add('ap-'+emoji.name);
        let output = ''+emoji.code_decimal+'';
        span.innerHTML = output + ' ';
        panel.appendChild(span);

        let customButton = document.querySelector('.bem-' + emoji.name);
        if (customButton) {
            customButton.addEventListener('click', function() {
                // quill.insertText(range.index, customButton.innerHTML);
                // quill.setSelection(range.index + customButton.innerHTML.length, 0);
                // range.index = range.index + customButton.innerHTML.length;
                quill.insertEmbed(range.index, 'emoji', emoji, Quill.sources.USER);
                setTimeout(() => quill.setSelection(range.index + 1), 0);
                fn_close();
            });
        }
    });
}

export default TextAreaEmoji;
