import { Vec3 } from "vec3";

export function angleBetweenVectors(vec1: Vec3, vec2: Vec3) {
    // Calcul du produit scalaire
    const dotProduct = vec1.dot(vec2);

    // Calcul des normes des vecteurs
    const normVec1 = vec1.norm();
    const normVec2 = vec2.norm();

    // Calcul de l'angle en radians
    const cosTheta = dotProduct / (normVec1 * normVec2);
    const angleRadians = Math.acos(cosTheta);

    // Conversion de radians en degrés
    const angleDegrees = Number((angleRadians * (180 / Math.PI)).toFixed(13));

    return angleDegrees;
}