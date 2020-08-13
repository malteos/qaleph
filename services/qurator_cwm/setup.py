from setuptools import setup, find_packages

setup(
    name="qurator_cwm",
    version="0.0.1",
    author="Malte Ostendorff",
    packages=find_packages(exclude=["tests"]),
    package_dir={"qurator_cwm": "qurator_cwm"},
    include_package_data=True,
    install_requires=[
        # qurator FTM is installed over requirements.txt
        "followthemoney-store[postgresql]==2.2.1",
        "servicelayer==1.13.5",
        "requests==2.24.0"
    ],
    license="MIT",
    zip_safe=False,
    test_suite="tests",
    tests_require=[],
    entry_points={"console_scripts": ["qurator_cwm = qurator_cwm.cli:cli"],},
)
