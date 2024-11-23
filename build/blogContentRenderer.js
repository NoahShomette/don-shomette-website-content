
heading_open = function (tokens, idx /*, options, env */) {
    switch (tokens[idx].hLevel) {
        case 1: {
            return '<h1 class="dark mt-15 f-display-small font-secondary ls-2">';
        }
        case 2: {
            return '<h2 class="mt-15 f-headline-large font-secondary dark ls-1">';
        }
        case 3: {
            return '<h3 class="mt-15 f-headline-medium bold dark">';
        }
        case 4: {
            return '<h4 class="mt-15 f-headline-small bold">';
        }
        case 5: {
            return '<h5 class="mt-15 f-title-large bold">';
        }
        case 6: {
            return '<h6 class="mt-15 f-title-medium bold">';
        }
    }
}

paragraph_open = function (tokens, idx) {
    return tokens[idx].tight ? '' : '<p class="f-body-large gray9 mt-15">';
}

bullet_list_open = function () {
    return '<ul class="list list-lg list-disc mt-30 gray7 f-body-large dark">\n';
}

ordered_list_open = function (tokens, idx) {
    const token = tokens[idx];
    const order = token.order > 1 ? ' start="' + token.order + '"' : '';
    return '<ol' + order + ' class="list-number list list-lg list-disc mt-30 gray7 f-body-large dark">\n';
}

link_open = function (tokens, idx, options /* env */) {
    let href = tokens[idx].href;
    const title = tokens[idx].title ? (' title="' + tokens[idx].title + '"') : '';
    const target = options.linkTarget ? (' target="' + options.linkTarget + '"') : '';
    return '<a class="colored underline-hover" href="' + href + '"' + title + target + '>';
};

link_close = function (/* tokens, idx, options, env */) {
    return '</a>';
};

var stack = [];

blockquote_open = function (state) {
    for (var i = 0; i < state.tokens.length; i++) {
        var tok = state.tokens[i];
        if (tok.type === 'blockquote_open') {
            state.tokens.splice(i, 1);
            state.tokens.splice(i, 0, { type: 'htmltag', content: '<blockquote class="bg-gray2 p-2 mt-15 lh-lg bl-3 f-title-large b-colored">', level: 0 });
            stack.push(tok);

        } else if (tok.type === 'blockquote_close') {
            stack.pop();
        }

        else if (stack.length && tok.type === 'inline') {
            state.tokens.splice(i - 1, 1);
            var last = tok.children.pop();
            //state.tokens.splice(i, 0, { type: 'htmltag', content: '<p class="fs-24 bold">', level: 0 });
            state.tokens.splice(i + 1, 0, { type: 'text', content: last.content, level: 0 });
            //state.tokens.splice(i + 2, 0, { type: 'htmltag', content: '</p>', level: 0 });

        }
    }
};

module.exports = {
    blogContentRenderer: function(md) {
        md.renderer.rules.heading_open = heading_open;
        md.renderer.rules.paragraph_open = paragraph_open;
        md.renderer.rules.bullet_list_open = bullet_list_open;
        md.renderer.rules.ordered_list_open = ordered_list_open;
        md.renderer.rules.link_open = link_open;
        md.renderer.rules.link_close = link_close;
        md.core.ruler.push('custom_blockquote', blockquote_open);
    }
};
