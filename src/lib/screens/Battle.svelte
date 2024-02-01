<h1>battle</h1>


<script lang="ts">

    import {SelectedSave} from "../js/saves/saves";
    import {BattleState} from "../js/battle/battle";
    import {Pokedex} from "../js/pokemons/pokedex";

    export let context: SelectedSave;
    export let battleContext: BattleState;
    export let canvas: HTMLCanvasElement;
    export let pokedex: Pokedex;
</script>

<style lang="scss">

</style>
