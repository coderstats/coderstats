Vue.component('user-link', {
    props: ['login', 'avatar_url'],
    template: `
    <div class="col-1-xl col-2-l col-4-m col-12">
        <a v-bind:href="'/github#' + login">
            <img :src="avatar_url" :alt="login"/><br>
            <i class="fa fa-user" aria-hidden="true"></i> {{ login }}
        </a>
    </div>
    `
});


new Vue({
    el: '#active-users',
    data: { events: null },
    computed: {
        users: function() {
            return d3.nest()
                .key(d => d.actor.login)
                .entries(this.events.filter(d => d.type === 'PushEvent'))
                .sort((a, b) => b.values.length - a.values.length);
        }
    },
    created: function() {
        this.$http.get('https://api.github.com/events').then(response => {
            this.events = response.body;
        });
    }
});


new Vue({
    el: '#followed-users',
    data: {users: []},
    created: function () {
        // https://api.github.com/search/users?q=repos:%3E1&sort=followers&order=desc
        this.$http.get('/data/users.json').then(response => {
            this.users = response.body.items;
        });
    }
});


new Vue({
    el: '#most-repos-users',
    data: {users: []},
    created: function () {
        // https://api.github.com/search/users?q=repos:%3E1%20type:user&sort=repositories&order=desc
        this.$http.get('/data/most-repos-users.json').then(response => {
            this.users = response.body.items;
        });
    }
});


new Vue({
    el: '#earliest-users',
    data: {users: []},
    created: function () {
        // https://api.github.com/search/users?q=repos:%3E1%20type:user&sort=joined&order=asc
        this.$http.get('/data/earliest-users.json').then(response => {
            this.users = response.body.items;
        });
    }
});