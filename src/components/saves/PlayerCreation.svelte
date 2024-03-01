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
    import {Save, SaveContext} from "../../js/saves/saves";
    import {Character} from "../../js/player/player";
    import {POKEDEX} from "../../js/const";
    import {start} from "../../js/mapping/maps/start";

    /**
     * Player creation component
     * lots todo here (design, classes, etc)
     */

    let playerName = 'Ethan';
    let playerClasses = [
        'conqueror',
        'bug-catcher'
    ]
    let selected = playerClasses[0];
    export let saveContext: SaveContext;

    function handleSubmit() {
        let player = Character.fromScratch(1, playerName, 'MALE');
        /*player.bag.addItems(4, 5); // pokeball
        player.bag.addItems(17, 5); // potion

        player.bag.addItems(1, 5);
        player.bag.addItems(2, 5);
        player.bag.addItems(3, 5);
        player.bag.addItems(23, 5);
        player.bag.addItems(24, 5);
        player.bag.addItems(25, 5);
        player.bag.addItems(26, 5);
        player.bag.addItems(30, 5);
        player.bag.addItems(31, 5);
        player.bag.addItems(32, 5);
        player.bag.addItems(33, 5);
        player.bag.addItems(28, 5);
        player.bag.addItems(29, 5);
*/
        player.monsters.push(POKEDEX.findById(3).result.instanciate(36));
        player.monsters.push(POKEDEX.findById(25).result.instanciate(5));

        player.monsters.push(POKEDEX.findById(6).result.instanciate(100));
        player.monsters.push(POKEDEX.findById(9).result.instanciate(5));
        player.monsters.push(POKEDEX.findById(143).result.instanciate(5));

        let chenipan = POKEDEX.findById(10).result.instanciate(6)
        console.log(chenipan);
        chenipan.currentXp = chenipan.xpToNextLevel - 1;
        player.monsters.push(chenipan);

        console.log(player);
        saveContext = saveContext.createSave(new Save(player, start));
    }

</script>

<style lang="scss">

</style>
