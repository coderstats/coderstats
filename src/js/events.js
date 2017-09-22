let events = new Vue({
    el: '#events',
    data: {
        events: null,
        response: null
    },
    computed: {
        users: function() {
            return d3.nest()
                .key(d => d.actor.login)
                .entries(this.events.filter(d => d.type === 'PushEvent'))
                .sort((a, b) => b.values.length - a.values.length);
        }
    },
    created: function() {
        this.fetchEvents();
    },
    methods: {
        fetchEvents: function() {
            let url = 'https://api.github.com/events';
            //url = '/data/events.json';
            this.$http.get(url).then(response => {
                this.response = response;
                this.events = response.body;
            });
        }
    }
});
