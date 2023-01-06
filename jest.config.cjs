module.exports = {
    testRegex: '.*\\.test\\.ts',
    preset: 'ts-jest',
    transform: {
        "^.+\\.jsx$":"babel-jest",
        "^.+\\.ts?$":"ts-jest"
    },
    collectCoverage: true,
    reporters: [
        "default",
        [
            "jest-junit",
            {
                outputDirectory: "reports",
                outputName: "testReport.xml",
            },
        ],
    ]
}
