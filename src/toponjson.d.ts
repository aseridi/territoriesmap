// src/types/topojson.d.ts or types/topojson.d.ts

// Declaration for importing JSON files
declare module '*.json' {
    const value: any;
    export default value;
}

// Declaration for importing TopoJSON files
declare module '*.topojson' {
    const value: any;
    export default value;
}

// Declaration for the `topojson-client` module
declare module 'topojson-client' {
    import { Geometry, Feature, FeatureCollection } from 'geojson';

    // Define the properties that a GeoJSON feature can have
    interface GeoJsonProperties {
        name: string; // You can add more properties as needed
        [key: string]: any; // Allow additional dynamic properties
    }

    // Define the structure of TopoJSON objects
    interface Objects<T> {
        [name: string]: {
            type: "GeometryCollection";
            geometries: Array<
                Geometry | null | {
                    type: string;
                    arcs: number[][][] | number[][];
                    id?: string | number;
                    properties: T;
                }
            >;
        };
    }

    // Define the structure of a TopoJSON topology
    interface Topology<T> {
        type: "Topology";
        arcs: number[][][];
        transform?: {
            scale: [number, number];
            translate: [number, number];
        };
        objects: Objects<T>;
    }

    // Exported functions from the `topojson-client` library
    export function feature<T>(
        topology: Topology<T>,
        object: any
    ): Feature | FeatureCollection;

    export function mesh<T>(
        topology: Topology<T>,
        object?: any,
        filter?: (a: any, b: any) => boolean
    ): Geometry;

    export function meshArcs<T>(
        topology: Topology<T>,
        object: any,
        filter: (a: any, b: any) => boolean
    ): Geometry;

    export function merge<T>(topology: Topology<T>): Geometry;

    export function mergeArcs<T>(
        topology: Topology<T>,
        objects: any[]
    ): Geometry;

    export function quantize<T>(topology: Topology<T>, n: number): Topology<T>;
}
