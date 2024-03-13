interface CustomPage {
  id: string 
  title: string 
  type: string
  sections: any[] 
  locale: string 
}

const performTransformation = (data: any[], additionalArgs:any): { transformedData: any[] ,transformedHomeData: any[]} => {
  if (!data) {
    throw new Error('Input data is undefined');
  }

  const transformedData = data.map((item) => {
    const transformedItem: Record<string, any> = {};

    additionalArgs.transformer.forEach((transform:any) => {
      const { inputFieldName, outputFieldName, convertTo } = transform;
      let value;

      if (item.hasOwnProperty(inputFieldName)) {
        value = item[inputFieldName];

        if (convertTo === 'integerToString') {
          value = String(parseInt(value, 10));
        } else if (convertTo === 'jsonArrayToList') {
          value = value.map((item: any) => item.toString());
        } else if (convertTo === 'stringToInteger') {
          value = parseInt(value, 10);
        }

        transformedItem[outputFieldName] = value;
      }
    });

    return transformedItem;
  });
  const transformedHomeData: any[] = []; 
  return {
    transformedData,transformedHomeData
  };
};

const performHomeTransformation = (data: any[], additionalArgs:any): {transformedHomeData: any[]} => {
  if (!data) {
    throw new Error('Input data is undefined');
  }

  const transformedHomeData = data.map((item) => {
    const transformedItem: Record<string, any> = {};

    additionalArgs.transformer.forEach((transform:any) => {
      const { inputFieldName, outputFieldName, convertTo } = transform;
      let value;

      if (item.hasOwnProperty(inputFieldName)) {
        value = item[inputFieldName];

        if (convertTo === 'integerToString') {
          value = String(parseInt(value, 10));
        } else if (convertTo === 'jsonArrayToList') {
          value = value.map((item: any) => item.toString());
        } else if (convertTo === 'stringToInteger') {
          value = parseInt(value, 10);
        }

        transformedItem[outputFieldName] = value;
      }
    });

    return transformedItem;
  });

  return {
    transformedHomeData,
  };
};


export function dataTransformer(data: any, transformerJsonConfig: any) {

function findProp(obj: any, prop: (string | string[]), defval: any) {
  if (typeof defval === 'undefined') defval = null;
  if (!Array.isArray(prop)) prop = [prop]; 
  for (var i = 0; i < prop.length; i++) {
      if (typeof obj[prop[i]] === 'undefined') return defval;
      obj = obj[prop[i]];
      if (Array.isArray(obj)) {
          return obj.map(item => findProp(item, prop.slice(i + 1), defval));
      }
  }
  return obj;
}


  const newItems = data.map((item: any) => {
    var transformItem: Record<string, any> = {};
    transformerJsonConfig.transformer.forEach((field: any) => {
      const { inputFieldName, outputFieldName } = field;
      const inputValue = findProp(item, inputFieldName.split('.'), null);
      transformItem[outputFieldName] = inputValue;
    });
    return transformItem;
  });

  return newItems;
}

// custom ui for storefront
export const customUi = (getPageData: any[]): CustomPage | undefined => {
  if (getPageData.length > 0) {
    const page = getPageData[0];
    const pageData: CustomPage = {
      id: page?.id,
      title: page?.title,
      type: page?.type,
      sections: page?.sections,
      locale: page?.locale,
    };

    return pageData;
  }

  return undefined;
};


export { performTransformation ,performHomeTransformation};

export interface TransformationResult {
}