function dataTransformer(data: any, transformerJsonConfig: any) {
    //var subStrings = []
    const newItems = data?.map((item: any) => {
        var transformItem: Record<string, any> = {}
        transformerJsonConfig.transformFields.forEach((field: any) => {
            const { inputField, outputField } = field;
            // if (inputField.includes('.')) {
            //     const InputFieldValue :String = fetchResultantValue(item,inputField);
            //     transformItem[outputField] = InputFieldValue 
            // }
            if(item[inputField] && inputField === "product"){
                transformItem[outputField] = item[inputField].featuredAsset.preview
            }
        
            else{
                transformItem[outputField] = item[inputField]
            }
        });
        return transformItem;
    })
    return newItems;
}

// function fetchResultantValue(item, inputField:String): String{
//     const subStrings = inputField.split('.');
//     console.log(subStrings);
//     const requiredValue = fetchFinalValue(item[subString[0]], subStrings.shift());
//     return requiredValue
// }

// function fetchFinalValue(item, subStrings:String[]) : String{
//     if(subStrings.length === 0){
//         return item
//     }
//     else{
//         return fetchFinalValue(item[subStrings[0]],subStrings.shift());
//     }
// }

export { dataTransformer }

export const transformPdpData = (data: any) => {
    const transformedData = {
        id: data?.id,
        handle: data?.slug,
        availableForSale: data?.variants[0]?.stockLevel === 'IN_STOCK' ? true : false,
        title: data?.name,
        description: data?.description,
        price: data?.variants[0]?.price,
        options: data?.optionGroups?.map(optionGroup => ({
            id: optionGroup?.id,
            name: optionGroup?.name,
            values: optionGroup?.options?.map(option => option?.name)
        })),
        featuredImage: {
            src: data?.featuredAsset?.preview,
            altText: data?.featuredImage?.altText || ''
        },
        images: data?.assets?.map(asset => ({
            src: asset?.preview,
            altText: ''
        })),
        variants: data?.variants?.map(variant => ({
            id: variant?.id,
            title: variant?.name,
            availableForSale: variant?.stockLevel === 'IN_STOCK' ? true : false,
            selectedOptions: variant?.options?.map(option => ({
                name: option?.group?.name,
                value: option?.name
            })),
            price: variant?.price,
            currencyCode: variant?.currencyCode,
        })),
        highPrice: data?.variants[0]?.price,
        lowPrice: data?.variants[0]?.price,
        currencyCode: data?.variants[0]?.currencyCode,

    }

    return transformedData;
};