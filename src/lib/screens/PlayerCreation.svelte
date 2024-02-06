<h1>player creation</h1>


<form on:submit|preventDefault={handleSubmit}>

    <select bind:value={selected}>
        {#each playerClasses as pClass}
            <option value={pClass}>
                {pClass}
            </option>
        {/each}
    </select>

    <input bind:value={playerName}/>

    <button type="submit">
        Let's go !
    </button>
</form>


<script lang="ts">
    import {Save, SaveContext} from "../js/saves/saves";
    import {Character} from "../js/player/player";
    import {testMap} from "../js/mapping/maps/test-map";
    import {POKEDEX} from "../js/const";

    let playerName = 'Ethan';
    let playerClasses = [
        'conqueror',
        'bug-catcher'
    ]
    let selected = playerClasses[0];
    export let saveContext: SaveContext;

    function handleSubmit() {
        let player = Character.fromScratch(1, playerName, 'MALE');
        player.monsters.push(POKEDEX.findById(6).result.instanciate(5));
       /* player.monsters.push(POKEDEX.findById(3).result.instanciate(5));
        player.monsters.push(POKEDEX.findById(6).result.instanciate(5));
        player.monsters.push(POKEDEX.findById(9).result.instanciate(5));
        player.monsters.push(POKEDEX.findById(143).result.instanciate(5));*/

        saveContext = saveContext.createSave(new Save(player, testMap));
    }

</script>

<style lang="scss">

</style>
