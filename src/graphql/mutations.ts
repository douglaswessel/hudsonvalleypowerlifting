import { gql } from '@apollo/client';

export const CONFIGURATION_FRAGMENT = gql`
  fragment Configuration on ConfigurationResult {
    typeName
    coId
    coName
    coDescription
    coriStatus
    hiConsistsOf {
      ... on ConfigurationSegmentResult {
        typeName
        cosId
        cosDisplayName
        cosDocumentation
        coriStatus
        cosHidden
        coriReadOnly
        hiConsistsOf {
          typeName
          ... on ConfigurationSegmentResult {
            cosId
            cosDisplayName
            cosDocumentation
            cosHidden
            coriReadOnly
            hiConsistsOf {
              typeName
              ... on ConfigurationSegmentResult {
                cosId
                cosDisplayName
                cosDocumentation
                cosHidden
                coriReadOnly
                hiConsistsOf {
                  ...ComponentResult
                  __typename
                }
                __typename
              }
              ...ComponentResult
              __typename
            }
            __typename
          }
          ...ComponentResult
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
`;

export const COMPONENT_RESULT_FRAGMENT = gql`
  fragment ComponentResult on ConfigurationComponentResult {
    typeName
    uid
    cocId
    cocDisplayName
    cocRequired
    cocHidden
    cocReadonly
    coriReadOnly
    ... on ConfigurationTextComponentResult {
      valueText: cocValue
      __typename
    }
    ... on ConfigurationNumberComponentResult {
      valueNumber: cocValue
      __typename
    }
    ... on ConfigurationBooleanComponentResult {
      valueBoolean: cocValue
      __typename
    }
    ... on ConfigurationDateComponentResult {
      valueDate: cocValue
      __typename
    }
    ... on ConfigurationRangeComponentResult {
      crcLowerValue
      crcUpperValue
      crcStep
      valueRange: cocValue
      __typename
    }
    ... on ConfigurationMultiRangeComponentResult {
      cmrcLowerValue
      cmrcUpperValue
      cmrcStep
      valueMultiRange: cocValue
      __typename
    }
    ... on ConfigurationPredefinedOptionsComponentResult {
      cocMultivalued
      cocOptions {
        uid
        cooId
        cooDisplayName
        cooHidden
        cooReadonly
        cooSelected
        __typename
      }
      __typename
    }
    ... on ConfigurationDurationComponent {
      valueDuration: cocValue {
        amount
        units
        __typename
      }
      __typename
    }
    ... on ConfigurationModelReferenceComponent {
      cmorcTypeName
      cmorcTitleField
      cocValue {
        uid
        __typename
      }
      __typename
    }
    __typename
  }
`;

export const SET_CONFIGURATION_COMPONENT_RESULT_VALUE = gql`
  ${COMPONENT_RESULT_FRAGMENT}
  ${CONFIGURATION_FRAGMENT}

  mutation setConfigurationComponentResultValue(
    $component: ConfigurationComponentResultReferenceInput!
    $value: Object
  ) {
    setConfigurationComponentResultValue(component: $component, value: $value) {
      ...Configuration
      __typename
    }
  }
`;

// Add your mutation for creating BI and starting configuration here
export const CREATE_BI_AND_START_CONFIGURATION = gql`
  mutation createBIAndStartConfiguration($input: CreateBIInput!) {
    createBIAndStartConfiguration(input: $input) {
      biId
      configurationId
      __typename
    }
  }
`;
