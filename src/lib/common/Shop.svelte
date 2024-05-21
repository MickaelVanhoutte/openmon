<script lang="ts">

    export let shop: OpenShop;
    export let context: GameContext;
</script>

<div class="shop">
    shop
</div>

<style lang="scss">
    .shop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 100;
    }
</style>
