<h1>player creation</h1>


<form on:submit|preventDefault={handleSubmit}>

    <select value={selected}>
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
    import {Character, PlayerSprites} from "../js/player/player";
    import {testMap} from "../js/mapping/maps/test-map";

    let playerName = 'Red';
    let playerClasses = [
        'conqueror',
        'bug-catcher'
    ]
    let selected = playerClasses[0];
    export let saveContext: SaveContext;

    function handleSubmit() {
        let player = Character.fromScratch(playerName, 'MALE', new PlayerSprites(
            'src/assets/characters/hero_male_front.png',
            'src/assets/characters/hero_male_back.png',
            'src/assets/characters/hero_male_left.png',
            'src/assets/characters/hero_male_right.png',
            'src/assets/characters/hero_male_back.png'));
        let save = new Save(player, testMap);
        saveContext.saves.push(save);
        localStorage.setItem('saves', JSON.stringify(saveContext.saves));
        saveContext = new SaveContext(saveContext.saves, false, save);
    }

</script>

<style lang="scss">

</style>
