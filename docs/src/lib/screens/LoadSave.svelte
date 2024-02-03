<h1>load save</h1>

<form on:submit|preventDefault={handleSubmit}>

    <select bind:value={selected}>
        {#each saveContext.saves as save}
            <option value={save}>
                {save.name} : {save.date}
            </option>
        {/each}
    </select>

    <!--// TODO : display team, sprites etc-->

    <button type="submit">
        Let's go !
    </button>
</form>

or

<form on:submit|preventDefault={startNew}>
    <button type="submit">
        Start a new game
    </button>
</form>


<script lang="ts">
    import {SaveContext} from "../js/saves/saves";
    import {Pokedex} from "../js/pokemons/pokedex";

    export let saveContext: SaveContext;

    let selected = saveContext.saves[0];

    export let pokedex: Pokedex;


    function handleSubmit() {
        console.log('selected', selected);
        saveContext = new SaveContext(saveContext.saves, false, selected);
        console.log('start from save', saveContext);
    }

    function startNew() {
        saveContext = new SaveContext(saveContext.saves, true);
        console.log('start fresh', saveContext);
    }
</script>

<style lang="scss">

</style>
