# Relatório do Projeto - Inquirições de Génere, Engenharia Web 2025/2026

## Descrição/Resumo

Secção para a introdução ao relatório
TODO

## Grupo de Trabalho

- André Dinis Alves Santos, a106854
- Daniel Gonçalves Parente, a107363
- Pedro Francisco Ferreira, a107292

## Dataset

### Tratamento de Dados

### Persistência de Dados

## Arquitetura

## Manual de Utilização

## Conclusão


# Campos do CSV que estavam vazios (e foram, portanto, removidos):

- Accruals
- AccumulationDates
- AcqInfo
- AlternativeTitle
- AltFormAvail
- Appraisal
- AppraisalElimination
- AppraisalEliminationDate
- Arrangement
- Author
- Authorities
- BiogHist
- Classifier
- ContainerTypeTerm
- Contributor
- CustodHist
- DescRules
- DocumentalTradition
- DocumentalTypology
- EntityType
- Functions
- GeneralContext
- GeogName
- Inscriptions
- InternalStructure
- LegalStatus
- Marks
- MaterialAuthor
- Monograms
- NormalizedFormsName
- OriginalNumbering
- OriginalsLoc
- OtherDescriptiveData
- OtherFindAid
- OtherFormsName
- Producer
- Recipient
- RetentionDisposalApplyDate
- RetentionDisposalClassification
- RetentionDisposalDocumentState
- RetentionDisposalFinalDestination
- RetentionDisposalObservations
- RetentionDisposalPeriod
- RetentionDisposalPolicy
- RetentionDisposalReference
- Signatures
- Stamps
- Terms
- TextualContent
- UnitDateBulk
- UnitDateNotes
- UseRestrict

# Campos do CSV que se consideraram irrelevantes (e foram, portanto removidos):

- AccessRestrict (tem 1 campo)
- AllowExtentsInference (tudo a False, nem sabemos bem o que é)
- AllowTextualContentInference (tudo a True, also não sabemos o que é)
- AllowUnitDatesInference (tudo a False, also não sabemos o que é)
- ApplySelectionTable (tudo a False, also não sabemos o que é)
- Available (tudo a False, also não sabemos o que é)
- CountryCode (tudo a PT, o que é um pouco óbvio)
- Highlighted (tudo a False, also não sabemos o que é)
- LangMaterial (< 10 campos, e todos a POR(Português), bastante óbvio que assim seria)
- PreviousLoc (o que é que é isto sequer)
- ProcessInfoDate (não faz sentido ter com o campo "Created" também presente)
- Published (tudo a True, que é meio óbvio)
- RepositoryCode (não faz sentido com o campo "Repository" presente)
- Revised
- UnitDateFinalCertainty
- UnitDateInitialCertainty
- UnitTitleType
- Username (mesmo que o campo "Creator")

# Comandos

- docker compose up -d --build
- docker compose down -v --rmi all --remove-orphans (para apagar tudo)